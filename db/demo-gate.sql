-- Demos moved from an email box to a real account.
--
-- The old gate asked for an email and rate-limited by hashed IP. Neither
-- identifies anyone: an address can be invented per run, and four IPs were
-- enough to exhaust a demo's whole daily quota and lock real visitors out.
-- A Clerk account is a stable identity, so it becomes the rate-limit key.
--
--   psql "$DATABASE_URL" -f db/demo-gate.sql
-- Guarded, so re-running is safe.

ALTER TABLE demo_runs ADD COLUMN IF NOT EXISTS clerk_user_id text;

-- Historic rows have no account and are left alone; the cap only ever looks
-- at today, so they stop mattering within a day of this shipping.
CREATE INDEX IF NOT EXISTS demo_runs_account_day_idx
    ON demo_runs (demo_key, clerk_user_id, created_at DESC)
    WHERE clerk_user_id IS NOT NULL;
