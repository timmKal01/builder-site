import { Pool } from 'pg';

// Shares the same Neon connection string as the rest of the site. Separate
// pool so a long signal run can never starve the request path that serves
// pages.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Due signals, carrying enough of their account for the caller to decide what
// the plan actually allows. `slot` is the signal's position within its own
// account, oldest first, so trimming to a plan's signal limit is stable: the
// same signals stay live run after run rather than rotating at random when
// someone downgrades or lapses.
export async function getDueSignals(limit = 50) {
    const { rows } = await pool.query(
        `SELECT * FROM (
             SELECT s.*,
                    a.email      AS account_email,
                    a.plan       AS account_plan,
                    a.paid_until AS account_paid_until,
                    a.currency   AS account_currency,
                    a.status     AS account_status,
                    row_number() OVER (PARTITION BY s.account_id ORDER BY s.id) AS slot
               FROM signals s
               JOIN accounts a ON a.id = s.account_id
              WHERE s.active
                AND a.status = 'active'
         ) t
          WHERE t.last_run_at IS NULL
             OR t.last_run_at <= now() - (CASE WHEN t.schedule = 'daily'
                                               THEN interval '23 hours'
                                               ELSE interval '167 hours' END)
          ORDER BY t.last_run_at NULLS FIRST
          LIMIT $1`,
        [limit]
    );
    return rows;
}

// Clerk owns identity, so the first authenticated request is what brings an
// account into being here. Done as an upsert rather than a Clerk webhook on
// purpose: a webhook adds a secret to verify and a failure mode where someone
// signs up and has no row at all. This cannot get out of step with itself.
export async function upsertAccount({ clerkUserId, email, currency }) {
    const { rows } = await pool.query(
        `INSERT INTO accounts (clerk_user_id, email, currency)
              VALUES ($1, $2, COALESCE($3, 'USD'))
         ON CONFLICT (clerk_user_id) DO UPDATE
                 SET email = EXCLUDED.email
           RETURNING *`,
        [clerkUserId, email, currency ?? null]
    );
    return rows[0];
}

// Moves the paid-until date out. The only write any of the three payment
// paths makes, which is the whole point of modelling a date rather than a
// subscription.
export async function extendAccess(accountId, { plan, paidUntil, interval, provider, customerId }) {
    const { rows } = await pool.query(
        `UPDATE accounts
            SET plan = $2,
                paid_until = $3,
                plan_interval = COALESCE($4, plan_interval),
                billing_provider = COALESCE($5, billing_provider),
                billing_customer_id = COALESCE($6, billing_customer_id)
          WHERE id = $1
      RETURNING *`,
        [accountId, plan, paidUntil, interval ?? null, provider ?? null, customerId ?? null]
    );
    return rows[0];
}

// Who to remind before they lapse. Matters most for M-Pesa, where renewal is
// a person deciding to pay rather than a card being charged.
export async function getExpiringAccounts(withinDays = 3) {
    const { rows } = await pool.query(
        `SELECT * FROM accounts
          WHERE status = 'active'
            AND paid_until IS NOT NULL
            AND paid_until > now()
            AND paid_until <= now() + ($1 || ' days')::interval
          ORDER BY paid_until`,
        [String(withinDays)]
    );
    return rows;
}

export async function startRun(signalId) {
    const { rows } = await pool.query(
        `INSERT INTO signal_runs (signal_id) VALUES ($1) RETURNING id, started_at`,
        [signalId]
    );
    return rows[0];
}

export async function finishRun(runId, { status, totalRows = 0, newRows = 0, apifyRunId = null, error = null }) {
    await pool.query(
        `UPDATE signal_runs
            SET finished_at = now(), status = $2, total_rows = $3,
                new_rows = $4, apify_run_id = $5, error = $6
          WHERE id = $1`,
        [runId, status, totalRows, newRows, apifyRunId, error]
    );
}

// Which of these fingerprints this signal has already surfaced. Sent as one
// array parameter rather than an IN list so a 500-row actor result stays a
// single round trip and cannot blow the parameter limit.
export async function filterSeen(signalId, fingerprints) {
    if (fingerprints.length === 0) return new Set();
    const { rows } = await pool.query(
        `SELECT fingerprint FROM signal_seen WHERE signal_id = $1 AND fingerprint = ANY($2::text[])`,
        [signalId, fingerprints]
    );
    return new Set(rows.map((r) => r.fingerprint));
}

// Records the new matches and marks them seen in one transaction. If this is
// interrupted, nothing is remembered, so the next run finds the same rows and
// delivers them — a duplicate is recoverable, a lead we marked seen but never
// sent is gone for good.
export async function commitMatches(signalId, runId, fresh) {
    if (fresh.length === 0) return;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const fingerprints = fresh.map((f) => f.fingerprint);
        const payloads = fresh.map((f) => JSON.stringify(f.row));

        await client.query(
            `INSERT INTO signal_matches (signal_id, run_id, fingerprint, payload)
             SELECT $1, $2, fp, pl::jsonb
               FROM unnest($3::text[], $4::text[]) AS t(fp, pl)`,
            [signalId, runId, fingerprints, payloads]
        );

        // ON CONFLICT covers two runs of the same signal overlapping; the row
        // is already remembered and the first run's timestamp is the true one.
        await client.query(
            `INSERT INTO signal_seen (signal_id, fingerprint)
             SELECT $1, fp FROM unnest($2::text[]) AS fp
             ON CONFLICT (signal_id, fingerprint) DO NOTHING`,
            [signalId, fingerprints]
        );

        await client.query('UPDATE signals SET last_run_at = now() WHERE id = $1', [signalId]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// A signal that found nothing still ran, so its clock has to move on or it
// will be due again on the very next tick.
export async function touchSignal(signalId) {
    await pool.query('UPDATE signals SET last_run_at = now() WHERE id = $1', [signalId]);
}

export async function getMatchesForRun(runId) {
    const { rows } = await pool.query(
        `SELECT fingerprint, payload, created_at FROM signal_matches WHERE run_id = $1 ORDER BY id`,
        [runId]
    );
    return rows;
}
