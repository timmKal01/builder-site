import { getDigestDueSignals, getMatchesSince, markEmailed } from '@/lib/signals/db.js';
import { renderDigest } from '@/lib/signals/email.js';
import { digestRecipients, emailConfig, sendDigest, weekOf, EmailSendError } from '@/lib/signals/digest.js';
import { effectivePlan } from '@/lib/signals/plans.js';
import { isCronAuthorized } from '@/lib/cronAuth.js';
import { SITE_URL } from '@/lib/site.js';

// The Monday email. Vercel Cron calls this once a week (see vercel.json), after
// the morning signals run, and every saved search gets one email with what it
// found since the last one, including a short "nothing new" note when that is
// the answer: a search that goes quiet looks broken, and a customer who hears
// nothing stops coming back.
//
// Sending needs RESEND_API_KEY and EMAIL_FROM. Without them this answers
// "not configured" and sends nothing, so the route can ship before the email
// account exists.

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_DURATION_MS = 300_000;
const SAFETY_MS = 30_000;

function describe(error) {
    if (!error) return 'unknown error';
    return error.code || error.message || String(error);
}

export async function GET(request) {
    if (!(await isCronAuthorized(request))) {
        return Response.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const config = emailConfig();
    if (!config) {
        return Response.json({ ok: true, sent: 0, skipped: 'email not configured (RESEND_API_KEY and EMAIL_FROM)' });
    }

    const startedAt = Date.now();
    const week = weekOf(new Date());
    const dashboardUrl = `${SITE_URL}/dashboard`;
    const summary = { sent: 0, empty: 0, parked: 0, noRecipient: 0, failed: 0, left: 0, signals: [] };

    let due;
    try {
        due = await getDigestDueSignals();
    } catch (error) {
        return Response.json({ error: `Could not read due signals: ${describe(error)}` }, { status: 500 });
    }

    for (const [i, signal] of due.entries()) {
        if (Date.now() - startedAt > MAX_DURATION_MS - SAFETY_MS) {
            // Anything left is still due and goes out on the next call.
            summary.left = due.length - i;
            break;
        }

        // A search the plan has parked isn't running, so an email saying
        // "nothing new" every week would be misleading. Its week is marked
        // anyway, so it isn't reconsidered on every call.
        const plan = effectivePlan({ plan: signal.account_plan, paid_until: signal.account_paid_until });
        if (Number(signal.slot) > plan.signals || !plan.schedules.includes(signal.schedule)) {
            await markEmailed(signal.id);
            summary.parked += 1;
            continue;
        }

        const to = digestRecipients(signal);
        if (to.length === 0) {
            await markEmailed(signal.id);
            summary.noRecipient += 1;
            summary.signals.push({ id: signal.id, error: 'no valid recipient' });
            continue;
        }

        try {
            const since = signal.last_emailed_at ?? signal.created_at;
            const matches = await getMatchesSince(signal.id, since);
            const { subject, html, text } = renderDigest({ signal, matches, dashboardUrl });
            await sendDigest({ config, to, subject, html, text, idempotencyKey: `digest-${signal.id}-${week}` });
            await markEmailed(signal.id);
            summary.sent += 1;
            if (matches.length === 0) summary.empty += 1;
            summary.signals.push({ id: signal.id, leads: matches.length });
        } catch (error) {
            summary.failed += 1;
            // A permanent failure (bad address, unverified domain) still marks
            // the week, so one bad row can't retry forever; a rate limit or an
            // outage leaves it due for the next call.
            const retryable = error instanceof EmailSendError ? error.retryable : true;
            if (!retryable) await markEmailed(signal.id);
            summary.signals.push({ id: signal.id, error: describe(error), retryable });
        }
    }

    return Response.json({ ok: true, week, durationMs: Date.now() - startedAt, due: due.length, ...summary });
}
