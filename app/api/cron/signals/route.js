import { getDueSignals, startRun, finishRun, filterSeen, commitMatches, touchSignal, countDeliveredThisMonth } from '@/lib/signals/db.js';
import { runSignal, SignalRunError, ACTOR_TIMEOUT_SECS } from '@/lib/signals/runner.js';
import { effectivePlan } from '@/lib/signals/plans.js';
import { citiesOf } from '@/lib/signals/gapFinder.js';

// Vercel Cron hits this on a schedule (see vercel.json) and runs every signal
// that is due.
//
// Cron invocations are plain HTTP requests to a public URL, so the shared
// secret is what stops anyone from triggering everyone's signals — and every
// trigger spends real Apify runs, so an open endpoint is a bill, not just a
// nuisance.

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// A new signal starts only while its whole actor run still fits inside the
// function's limit, with a margin. Being cut off mid-run is worse than it looks:
// Gap Finder remembers what it returned for the signal, so a run whose rows were
// never committed here would lose those leads. A signal left over is simply due
// on the next tick.
const MAX_DURATION_MS = 300_000;
const RUN_BUDGET_MS = ACTOR_TIMEOUT_SECS * 1000 + 20_000;
const MAX_PER_TICK = 25;

function unauthorized() {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
}

// A failed Postgres connection surfaces as an AggregateError whose `message`
// is empty, which makes for a useless log line. The code ('ECONNREFUSED' and
// friends) is the part that actually says what went wrong.
function describe(error) {
    if (!error) return 'unknown error';
    return error.code || error.message || String(error);
}

// Vercel sends `Authorization: Bearer <CRON_SECRET>`. Compared with a length
// check first because timingSafeEqual throws on a length mismatch.
async function isAuthorized(request) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;

    const header = request.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (token.length !== secret.length) return false;

    const { timingSafeEqual } = await import('node:crypto');
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}

export async function GET(request) {
    if (!(await isAuthorized(request))) return unauthorized();

    const startedAt = Date.now();
    const db = { startRun, finishRun, filterSeen, commitMatches };
    const summary = { ran: 0, newLeads: 0, empty: 0, failed: 0, gated: 0, capped: 0, skipped: 0, signals: [] };
    // Leads each account has had this month, read once per account and kept
    // current as this tick delivers more.
    const deliveredThisMonth = new Map();

    let due;
    try {
        due = await getDueSignals(MAX_PER_TICK);
    } catch (error) {
        return Response.json({ error: `Could not read due signals: ${describe(error)}` }, { status: 500 });
    }

    for (const signal of due) {
        // What the account is entitled to right now, not what it once bought.
        // A lapsed Pro account falls back to the free limits rather than
        // stopping dead, so it keeps trickling leads and has a reason to renew.
        const plan = effectivePlan({
            plan: signal.account_plan,
            paid_until: signal.account_paid_until,
        });

        // Signals beyond the plan's allowance, or on a cadence the plan does
        // not include, are parked rather than run. Their clock still moves on,
        // otherwise they stay permanently due and are reconsidered every tick.
        if (Number(signal.slot) > plan.signals || !plan.schedules.includes(signal.schedule)) {
            await touchSignal(signal.id);
            summary.gated += 1;
            summary.signals.push({ id: signal.id, name: signal.name, gated: plan.name });
            continue;
        }

        // The monthly cap. A run asks Gap Finder for at least one lead per city,
        // so a search is parked once fewer leads are left than it has cities:
        // anything it returned over the cap would be remembered by Gap Finder
        // and never delivered.
        if (!deliveredThisMonth.has(signal.account_id)) {
            deliveredThisMonth.set(signal.account_id, await countDeliveredThisMonth(signal.account_id));
        }
        const leftThisMonth = plan.maxNewPerMonth - deliveredThisMonth.get(signal.account_id);
        const maxNew = Math.min(plan.maxNewPerRun, leftThisMonth);
        if (maxNew < Math.max(1, citiesOf(signal.input).length)) {
            await touchSignal(signal.id);
            summary.capped += 1;
            summary.signals.push({ id: signal.id, name: signal.name, capped: plan.name });
            continue;
        }

        if (Date.now() - startedAt > MAX_DURATION_MS - RUN_BUDGET_MS) {
            // Everything left stays due and is picked up on the next tick.
            summary.skipped = due.length - summary.ran - summary.failed - summary.gated - summary.capped;
            break;
        }

        try {
            const result = await runSignal(signal, {
                db,
                token: process.env.APIFY_TOKEN,
                maxNew,
            });
            deliveredThisMonth.set(signal.account_id, deliveredThisMonth.get(signal.account_id) + result.fresh.length);
            summary.ran += 1;
            summary.newLeads += result.fresh.length;
            if (result.fresh.length === 0) {
                // commitMatches is what normally moves the clock, and it is a
                // no-op when there is nothing new. Without this an empty signal
                // would stay due and re-run on every single tick.
                await touchSignal(signal.id);
                summary.empty += 1;
            }
            summary.signals.push({ id: signal.id, name: signal.name, new: result.fresh.length });
        } catch (error) {
            summary.failed += 1;
            const retryable = error instanceof SignalRunError && error.retryable;
            // A retryable failure (rate limit, source down) leaves the clock
            // alone so the next tick picks it straight back up. A permanent one
            // — bad saved input — moves the clock on, otherwise it would jam
            // the queue and burn a run every tick forever.
            if (!retryable) await touchSignal(signal.id);
            summary.signals.push({ id: signal.id, name: signal.name, error: describe(error), retryable });
        }
    }

    return Response.json({
        ok: true,
        durationMs: Date.now() - startedAt,
        due: due.length,
        ...summary,
    });
}
