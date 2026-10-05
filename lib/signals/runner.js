import { getSource } from './sources.js';

// Running one signal: call its actor, work out which rows the customer has not
// already been shown, record those, and remember them so next time they are
// old news.
//
// The ordering here is deliberate. Rows are marked seen in the same
// transaction that records them as matches, so a crash between the two cannot
// leave a lead that is remembered but never delivered — the failure mode that
// would quietly lose a customer the one thing they pay for. Delivery happens
// after the transaction commits and is retried from the stored matches, never
// from a fresh actor run.

export class SignalRunError extends Error {
    constructor(message, { retryable = false } = {}) {
        super(message);
        this.name = 'SignalRunError';
        this.retryable = retryable;
    }
}

// Apify's run-sync endpoint blocks until the actor finishes, which is fine for
// the small, bounded searches a signal makes and saves us polling for a run id.
async function fetchRows({ actor, input, token, signal }) {
    const res = await fetch(
        `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
            signal,
        }
    );

    if (!res.ok) {
        // 5xx and 429 are worth another tick; a 4xx means the saved input is
        // wrong and retrying it on a schedule just burns runs forever.
        const retryable = res.status === 429 || res.status >= 500;
        throw new SignalRunError(`Actor run failed (${res.status})`, { retryable });
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) {
        throw new SignalRunError('Actor returned an unexpected payload', { retryable: false });
    }
    return { rows, apifyRunId: res.headers.get('x-apify-run-id') ?? null };
}

// Rows that carry no stable identity are dropped rather than passed through.
// Letting them through would mean re-delivering them on every single run,
// which reads to the customer as a feed that repeats itself.
export function fingerprintRows(rows, source) {
    const seen = new Set();
    const out = [];
    let skipped = 0;

    for (const row of rows) {
        let fp = null;
        try {
            fp = source.fingerprint(row);
        } catch {
            fp = null;
        }
        if (!fp) {
            skipped += 1;
            continue;
        }
        // One actor run can return the same business twice; collapse inside the
        // batch before we ever compare against history.
        if (seen.has(fp)) continue;
        seen.add(fp);
        out.push({ fingerprint: fp, row });
    }

    return { rows: out, skipped };
}

export async function runSignal(signal, { db, token, signal: abortSignal } = {}) {
    const source = getSource(signal.source);
    if (!source) throw new SignalRunError(`Unknown source "${signal.source}"`, { retryable: false });
    if (!token) throw new SignalRunError('APIFY_TOKEN is not configured', { retryable: false });

    const run = await db.startRun(signal.id);

    try {
        const input = { ...source.defaultInput, ...(signal.input ?? {}) };
        const { rows, apifyRunId } = await fetchRows({
            actor: source.actor,
            input,
            token,
            signal: abortSignal,
        });

        const { rows: candidates, skipped } = fingerprintRows(rows, source);
        const known = await db.filterSeen(
            signal.id,
            candidates.map((c) => c.fingerprint)
        );
        const fresh = candidates.filter((c) => !known.has(c.fingerprint));

        if (source.rank) {
            fresh.sort((a, b) => source.rank(a.row) - source.rank(b.row));
        }

        // Marks seen and records matches together — see the note at the top.
        await db.commitMatches(signal.id, run.id, fresh);

        await db.finishRun(run.id, {
            status: 'ok',
            totalRows: rows.length,
            newRows: fresh.length,
            apifyRunId,
        });

        return { runId: run.id, total: rows.length, fresh, skipped };
    } catch (error) {
        await db.finishRun(run.id, {
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}

// Which signals the next cron tick should pick up. Weekly ones are not pinned
// to a weekday: a signal created on a Tuesday runs on Tuesdays, which spreads
// load across the week on its own without a scheduling table.
export function isDue(signal, now = new Date()) {
    if (!signal.active) return false;
    if (!signal.last_run_at) return true;

    const elapsedMs = now.getTime() - new Date(signal.last_run_at).getTime();
    const period = signal.schedule === 'daily' ? 24 : 24 * 7;
    // A tolerance of an hour stops a cron tick that lands a few minutes early
    // from pushing every signal a full day later each time it runs.
    return elapsedMs >= (period - 1) * 60 * 60 * 1000;
}
