import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    PLANS,
    PRICES,
    CURRENCIES,
    INTERVALS,
    getPlan,
    effectivePlan,
    priceFor,
    formatPrice,
    extendFrom,
} from '../lib/signals/plans.js';
import { runSignal } from '../lib/signals/runner.js';

const NOW = new Date('2026-10-05T12:00:00Z');

test('a paid account inside its window gets its full plan', () => {
    const plan = effectivePlan({ plan: 'pro', paid_until: '2026-11-01T00:00:00Z' }, NOW);
    assert.equal(plan.name, 'pro');
    assert.equal(plan.lapsed, false);
    assert.equal(plan.signals, PLANS.pro.signals);
});

test('a lapsed account falls back to free rather than stopping dead', () => {
    const plan = effectivePlan({ plan: 'pro', paid_until: '2026-10-01T00:00:00Z' }, NOW);
    assert.equal(plan.name, 'free');
    assert.equal(plan.lapsed, true, 'lapsing must be distinguishable from never having paid');
    assert.equal(plan.signals, PLANS.free.signals);
});

test('a paid plan with no date is not a free ride', () => {
    // Guards the obvious exploit: set plan to pro, never pay, run forever.
    const plan = effectivePlan({ plan: 'pro', paid_until: null }, NOW);
    assert.equal(plan.name, 'free');
    assert.equal(plan.lapsed, true);
});

test('a junk or unknown plan degrades to free instead of throwing', () => {
    for (const plan of [{ plan: 'enterprise' }, { plan: null }, {}, undefined]) {
        const resolved = effectivePlan(plan, NOW);
        assert.equal(resolved.signals, PLANS.free.signals);
    }
    assert.equal(getPlan('__proto__').signals, PLANS.free.signals);
    assert.equal(getPlan('constructor').signals, PLANS.free.signals);
});

test('a bad paid_until value is treated as unpaid, not as valid', () => {
    const plan = effectivePlan({ plan: 'pro', paid_until: 'not-a-date' }, NOW);
    assert.equal(plan.name, 'free');
});

test('free is weekly only; pro may also run daily', () => {
    assert.deepEqual(PLANS.free.schedules, ['weekly']);
    assert.ok(PLANS.pro.schedules.includes('daily'));
    assert.ok(PLANS.free.maxNewPerRun < PLANS.pro.maxNewPerRun);
});

test('both currencies are priced for both intervals', () => {
    for (const currency of CURRENCIES) {
        for (const interval of INTERVALS) {
            const amount = priceFor('pro', currency, interval);
            assert.ok(Number.isInteger(amount) && amount > 0, `missing ${currency}/${interval}`);
        }
    }
    assert.equal(priceFor('pro', 'GBP', 'monthly'), null);
    assert.equal(priceFor('free', 'USD', 'monthly'), null);
});

test('quarterly is cheaper than three months, which is why it reduces renewals', () => {
    for (const currency of CURRENCIES) {
        const monthly = priceFor('pro', currency, 'monthly');
        const quarterly = priceFor('pro', currency, 'quarterly');
        assert.ok(quarterly < monthly * 3, `${currency} quarterly is not a discount`);
        assert.ok(quarterly > monthly, `${currency} quarterly is cheaper than one month`);
    }
});

test('the KES price is set for its own market, not converted from USD', () => {
    // ~129.5 KES to the dollar in October 2026. A straight conversion of the
    // USD price would be about KES 634,550 in minor units; the local price is
    // deliberately well below it.
    const converted = PRICES.pro.USD.monthly * 129.5;
    assert.ok(
        PRICES.pro.KES.monthly < converted * 0.6,
        'KES price drifted up towards an FX conversion of the USD price'
    );
});

test('formatPrice renders each currency the way its market reads it', () => {
    assert.equal(formatPrice(4900, 'USD'), '$49');
    assert.equal(formatPrice(13200, 'USD'), '$132');
    assert.equal(formatPrice(4950, 'USD'), '$49.50');
    assert.equal(formatPrice(250000, 'KES'), 'KES 2,500');
    assert.equal(formatPrice(null, 'USD'), null);
});

test('renewing early adds to the time left instead of discarding it', () => {
    const until = extendFrom('2026-11-01T00:00:00Z', 'monthly', NOW);
    assert.equal(until.toISOString(), '2026-12-01T00:00:00.000Z');
});

test('paying late starts from now, never back-dated into the past', () => {
    const until = extendFrom('2026-08-01T00:00:00Z', 'monthly', NOW);
    assert.equal(until.toISOString(), '2026-11-05T12:00:00.000Z');
    assert.ok(until > NOW, 'a payment must always buy time in the future');
});

test('a first payment runs from now', () => {
    assert.equal(extendFrom(null, 'monthly', NOW).toISOString(), '2026-11-05T12:00:00.000Z');
    assert.equal(extendFrom(null, 'quarterly', NOW).toISOString(), '2027-01-05T12:00:00.000Z');
});

test('extending across a year boundary rolls the year', () => {
    const until = extendFrom('2026-12-20T00:00:00Z', 'monthly', NOW);
    assert.equal(until.toISOString(), '2027-01-20T00:00:00.000Z');
});

// --- the per-run cap, which is where a cheap plan could silently eat leads ---

function fakeDb() {
    const seen = new Set();
    return {
        seen,
        committed: [],
        startRun: async () => ({ id: 1 }),
        filterSeen: async (_id, fps) => new Set(fps.filter((f) => seen.has(f))),
        commitMatches: async function (_s, _r, fresh) {
            this.committed.push(fresh);
            fresh.forEach((f) => seen.add(f.fingerprint));
        },
        finishRun: async () => {},
    };
}

test('the free cap delays leads, it never destroys them', async (t) => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });

    const rows = Array.from({ length: 25 }, (_, i) => ({ placeId: `p${i}`, opportunityScore: i }));
    globalThis.fetch = async () => ({
        ok: true, status: 200, headers: { get: () => null }, json: async () => rows,
    });

    const db = fakeDb();
    const signal = { id: 1, source: 'website-gap-finder', input: {} };

    const first = await runSignal(signal, { db, token: 't', maxNew: 10 });
    assert.equal(first.fresh.length, 10, 'delivered more than the cap');
    assert.equal(first.held, 15);
    assert.equal(db.seen.size, 10, 'rows over the cap were marked seen and are now lost');

    // Same actor output next run: the held-back rows must still come through.
    const second = await runSignal(signal, { db, token: 't', maxNew: 10 });
    assert.equal(second.fresh.length, 10);
    assert.equal(db.seen.size, 20);

    const third = await runSignal(signal, { db, token: 't', maxNew: 10 });
    assert.equal(third.fresh.length, 5, 'the remainder never arrived');
    assert.equal(third.held, 0);
});

test('the cap keeps the highest-scoring leads first', async (t) => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });

    globalThis.fetch = async () => ({
        ok: true, status: 200, headers: { get: () => null },
        json: async () => [
            { placeId: 'low', opportunityScore: 10 },
            { placeId: 'high', opportunityScore: 95 },
            { placeId: 'mid', opportunityScore: 50 },
        ],
    });

    const { fresh } = await runSignal(
        { id: 1, source: 'website-gap-finder', input: {} },
        { db: fakeDb(), token: 't', maxNew: 1 }
    );
    assert.equal(fresh[0].row.placeId, 'high');
});

test('an uncapped run delivers everything', async (t) => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });

    globalThis.fetch = async () => ({
        ok: true, status: 200, headers: { get: () => null },
        json: async () => [{ placeId: 'a' }, { placeId: 'b' }],
    });

    const { fresh, held } = await runSignal(
        { id: 1, source: 'website-gap-finder', input: {} },
        { db: fakeDb(), token: 't' }
    );
    assert.equal(fresh.length, 2);
    assert.equal(held, 0);
});
