import { getDueSignals, startRun, finishRun, filterSeen, commitMatches, touchSignal } from '@/lib/signals/db.js';
import { runSignal, SignalRunError } from '@/lib/signals/runner.js';
import { effectivePlan } from '@/lib/signals/plans.js';

// Vercel Cron hits this on a schedule (see vercel.json) and runs every signal
// that is due.
//
// Cron invocations are plain HTTP requests to a public URL, so the shared
// secret is what stops anyone from triggering everyone's signals — and every
// trigger spends real Apify runs, so an open endpoint is a bill, not just a
// nuisance.

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Stop starting new signals with this much of the budget left, so the ones
// already running get to finish and record their matches. A signal cut off
// mid-run rolls back and is simply due again on the next tick; the damage of
// overrunning is an unrecorded run, not a lost lead.
const TIME_BUDGET_MS = 240_000;
const RESERVE_MS = 45_000;
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
    const summary = { ran: 0, newLeads: 0, empty: 0, failed: 0, gated: 0, skipped: 0, signals: [] };

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

        if (Date.now() - startedAt > TIME_BUDGET_MS - RESERVE_MS) {
            // Everything left stays due and is picked up on the next tick.
            summary.skipped = due.length - summary.ran - summary.failed - summary.gated;
            break;
        }

        try {
            const result = await runSignal(signal, {
                db,
                token: process.env.APIFY_TOKEN,
                maxNew: plan.maxNewPerRun,
            });
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
