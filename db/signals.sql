-- Signals: saved searches over the lead-gen actors that run on a schedule and
-- surface only what is new since last time.
--
-- Run once against the Neon database:
--   psql "$DATABASE_URL" -f db/signals.sql
-- Every statement is guarded, so re-running it is safe.

-- A paying customer. Clerk owns identity; billing is deliberately not tied to
-- one processor. Stripe does not support Kenya, and the customer base spans
-- Nairobi (M-Pesa, KES) and international (cards, USD), so the provider is a
-- column rather than an assumption. Early accounts are billed by hand and
-- carry provider 'manual', which the engine treats like any other.
CREATE TABLE IF NOT EXISTS accounts (
    id                  bigserial PRIMARY KEY,
    clerk_user_id       text UNIQUE NOT NULL,
    email               text NOT NULL,
    billing_provider    text NOT NULL DEFAULT 'manual',  -- manual | paystack
    billing_customer_id text,
    currency            text NOT NULL DEFAULT 'USD',     -- USD | KES
    plan                text NOT NULL DEFAULT 'free',
    plan_interval       text NOT NULL DEFAULT 'monthly', -- monthly | quarterly
    -- The single gate on everything paid. A card webhook, an M-Pesa payment
    -- and a hand-marked invoice all do the same thing: push this date out.
    -- Nothing downstream has to know which of the three happened.
    paid_until          timestamptz,
    status              text NOT NULL DEFAULT 'active',
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- Existing deployments: add the billing date columns without touching rows.
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS plan_interval text NOT NULL DEFAULT 'monthly';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS paid_until timestamptz;

-- Finding who to remind before they lapse is a scheduled job, so it should
-- not scan the table to do it.
CREATE INDEX IF NOT EXISTS accounts_paid_until_idx ON accounts (paid_until)
    WHERE paid_until IS NOT NULL;

-- One id per provider, but two accounts can both be 'manual' with no id.
CREATE UNIQUE INDEX IF NOT EXISTS accounts_billing_customer_idx
    ON accounts (billing_provider, billing_customer_id)
    WHERE billing_customer_id IS NOT NULL;

-- A saved search. `source` keys into SOURCES in lib/signals/sources.js and
-- `input` is that actor's own input object, stored whole so a source can grow
-- new fields without a migration here.
CREATE TABLE IF NOT EXISTS signals (
    id          bigserial PRIMARY KEY,
    account_id  bigint NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name        text NOT NULL,
    source      text NOT NULL,
    input       jsonb NOT NULL DEFAULT '{}'::jsonb,
    schedule    text NOT NULL DEFAULT 'weekly',  -- 'daily' | 'weekly'
    deliver_to  text[] NOT NULL DEFAULT '{}',
    webhook_url text,
    active      boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    last_run_at timestamptz
);

CREATE INDEX IF NOT EXISTS signals_account_idx ON signals (account_id);
-- The cron tick asks "what is due?", so it reads by active + last_run_at and
-- should never have to scan the whole table to find out.
CREATE INDEX IF NOT EXISTS signals_due_idx ON signals (active, last_run_at)
    WHERE active;

-- One execution. Kept whether or not it found anything, because "we looked and
-- there was nothing" is information the customer is paying for too, and a run
-- that failed needs to be visible rather than silently skipped.
CREATE TABLE IF NOT EXISTS signal_runs (
    id           bigserial PRIMARY KEY,
    signal_id    bigint NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    started_at   timestamptz NOT NULL DEFAULT now(),
    finished_at  timestamptz,
    status       text NOT NULL DEFAULT 'running',  -- running | ok | error
    total_rows   integer NOT NULL DEFAULT 0,
    new_rows     integer NOT NULL DEFAULT 0,
    apify_run_id text,
    error        text
);

CREATE INDEX IF NOT EXISTS signal_runs_signal_idx ON signal_runs (signal_id, started_at DESC);

-- The memory that makes this a product rather than a scheduled scrape: every
-- row identity this signal has ever surfaced. Deliberately narrow, since it
-- grows forever and is only ever asked "have I seen this before".
CREATE TABLE IF NOT EXISTS signal_seen (
    signal_id     bigint NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    fingerprint   text NOT NULL,
    first_seen_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (signal_id, fingerprint)
);

-- The new rows themselves, kept so the dashboard and CSV export have something
-- to read without re-running the actor.
CREATE TABLE IF NOT EXISTS signal_matches (
    id          bigserial PRIMARY KEY,
    signal_id   bigint NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    run_id      bigint NOT NULL REFERENCES signal_runs(id) ON DELETE CASCADE,
    fingerprint text NOT NULL,
    payload     jsonb NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signal_matches_signal_idx ON signal_matches (signal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS signal_matches_run_idx ON signal_matches (run_id);

-- Every payment, however it arrived. The account row only carries the current
-- paid_until; this is the history behind it. Needed the first time a customer
-- asks what they paid and when, which no amount of "the date says so" answers.
CREATE TABLE IF NOT EXISTS account_payments (
    id           bigserial PRIMARY KEY,
    account_id   bigint NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount_minor bigint NOT NULL,
    currency     text NOT NULL,
    interval     text NOT NULL,
    provider     text NOT NULL,            -- manual | paystack
    reference    text,                     -- M-Pesa code, transfer ref, Paystack id
    paid_until   timestamptz NOT NULL,     -- what this payment bought
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_payments_account_idx
    ON account_payments (account_id, created_at DESC);

-- A provider reference is unique where there is one, so replaying the same
-- Paystack webhook cannot credit an account twice.
CREATE UNIQUE INDEX IF NOT EXISTS account_payments_reference_idx
    ON account_payments (provider, reference)
    WHERE reference IS NOT NULL;
