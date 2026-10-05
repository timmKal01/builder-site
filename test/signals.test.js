import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomain, SOURCES, getSource, isKnownSource } from '../lib/signals/sources.js';
import { fingerprintRows, isDue, runSignal, SignalRunError } from '../lib/signals/runner.js';

// These cover the two ways the product can break in a way the customer feels:
// showing the same lead twice, or never showing it at all. Everything here is
// pure, so none of it needs a database or a network.

test('normalizeDomain collapses the spellings of one domain', () => {
    const expected = 'acme.co.ke';
    for (const input of [
        'acme.co.ke',
        'www.acme.co.ke',
        'https://acme.co.ke',
        'https://www.acme.co.ke/',
        'HTTP://WWW.Acme.co.ke',
        'https://acme.co.ke/pricing?ref=x#top',
        'acme.co.ke:443',
        'acme.co.ke.',
    ]) {
        assert.equal(normalizeDomain(input), expected, `failed for ${input}`);
    }
});

test('normalizeDomain rejects junk rather than inventing a key', () => {
    for (const input of ['', '   ', null, undefined, 42, {}]) {
        assert.equal(normalizeDomain(input), null);
    }
});

test('normalizeDomain keeps genuinely different domains apart', () => {
    assert.notEqual(normalizeDomain('acme.co.ke'), normalizeDomain('acme.com'));
    assert.notEqual(normalizeDomain('shop.acme.com'), normalizeDomain('acme.com'));
});

test('website-gap-finder prefers placeId, which outlives a changed website', () => {
    const source = SOURCES['website-gap-finder'];
    const monday = { placeId: 'ChIJabc', name: 'Glow Salon', websiteUrl: null, opportunityScore: 90 };
    const friday = { placeId: 'ChIJabc', name: 'Glow Salon', websiteUrl: 'https://glow.co.ke', opportunityScore: 40 };
    assert.equal(source.fingerprint(monday), source.fingerprint(friday));
});

test('website-gap-finder falls back when there is no placeId', () => {
    const source = SOURCES['website-gap-finder'];
    assert.equal(source.fingerprint({ websiteUrl: 'https://www.glow.co.ke/' }), 'glow.co.ke');
    assert.equal(source.fingerprint({ name: 'Glow Salon', city: 'Nairobi' }), 'Glow Salon|Nairobi');
    assert.equal(source.fingerprint({}), null);
});

test('every source produces a stable fingerprint or null, never a throw', () => {
    for (const [key, source] of Object.entries(SOURCES)) {
        assert.doesNotThrow(() => source.fingerprint({}), `${key} threw on an empty row`);
        assert.equal(source.fingerprint({}), null, `${key} invented a key for an empty row`);
    }
});

test('fingerprintRows drops rows with no identity instead of repeating them forever', () => {
    const source = getSource('website-gap-finder');
    const { rows, skipped } = fingerprintRows(
        [{ placeId: 'a' }, {}, { placeId: 'b' }, { name: '', city: '' }],
        source
    );
    assert.equal(rows.length, 2);
    assert.equal(skipped, 2);
});

test('fingerprintRows collapses duplicates inside one actor run', () => {
    const source = getSource('website-gap-finder');
    const { rows } = fingerprintRows(
        [
            { placeId: 'a', name: 'first' },
            { placeId: 'a', name: 'second' },
            { placeId: 'b' },
        ],
        source
    );
    assert.equal(rows.length, 2);
    assert.equal(rows[0].row.name, 'first', 'kept the later duplicate instead of the first');
});

test('fingerprintRows survives a source whose fingerprint throws', () => {
    const exploding = { fingerprint: () => { throw new Error('bad row'); } };
    const { rows, skipped } = fingerprintRows([{ a: 1 }], exploding);
    assert.equal(rows.length, 0);
    assert.equal(skipped, 1);
});

test('isDue respects schedule and skips inactive signals', () => {
    const now = new Date('2026-10-05T12:00:00Z');
    const at = (iso) => ({ active: true, schedule: 'daily', last_run_at: iso });

    assert.equal(isDue({ active: true, schedule: 'daily', last_run_at: null }, now), true);
    assert.equal(isDue(at('2026-10-04T11:00:00Z'), now), true);
    assert.equal(isDue(at('2026-10-05T06:00:00Z'), now), false);
    assert.equal(isDue({ active: false, schedule: 'daily', last_run_at: null }, now), false);

    const weekly = (iso) => ({ active: true, schedule: 'weekly', last_run_at: iso });
    assert.equal(isDue(weekly('2026-09-28T11:00:00Z'), now), true);
    assert.equal(isDue(weekly('2026-10-03T12:00:00Z'), now), false);
});

test('isDue tolerates a cron tick landing slightly early', () => {
    // Without the tolerance a daily signal drifts later every single day.
    const now = new Date('2026-10-05T11:58:00Z');
    assert.equal(isDue({ active: true, schedule: 'daily', last_run_at: '2026-10-04T12:00:00Z' }, now), true);
});

// --- runSignal, against a fake db and a stubbed fetch ---

function fakeDb() {
    const calls = { commits: [], finished: null };
    return {
        calls,
        seen: new Set(),
        startRun: async () => ({ id: 1 }),
        filterSeen: async function (_id, fps) {
            return new Set(fps.filter((f) => this.seen.has(f)));
        },
        commitMatches: async function (_sid, _rid, fresh) {
            calls.commits.push(fresh);
            fresh.forEach((f) => this.seen.add(f.fingerprint));
        },
        finishRun: async (_id, info) => { calls.finished = info; },
    };
}

function stubFetch(payload, { status = 200 } = {}) {
    globalThis.fetch = async () => ({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: () => 'run-123' },
        json: async () => payload,
    });
}

test('a lead is delivered once, then never again', async (t) => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });

    const db = fakeDb();
    const signal = { id: 1, source: 'website-gap-finder', input: {} };
    stubFetch([{ placeId: 'a', opportunityScore: 80 }, { placeId: 'b', opportunityScore: 90 }]);

    const first = await runSignal(signal, { db, token: 't' });
    assert.equal(first.fresh.length, 2);

    // Same actor output on the next run: the customer should see nothing new.
    const second = await runSignal(signal, { db, token: 't' });
    assert.equal(second.fresh.length, 0);
    assert.equal(second.total, 2, 'still saw both rows, just had nothing new to say');
});

test('new rows are ranked worst-website-first', async (t) => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });

    const db = fakeDb();
    stubFetch([
        { placeId: 'a', opportunityScore: 40 },
        { placeId: 'b', opportunityScore: 95 },
        { placeId: 'c', opportunityScore: 70 },
    ]);

    const { fresh } = await runSignal({ id: 1, source: 'website-gap-finder', input: {} }, { db, token: 't' });
    assert.deepEqual(fresh.map((f) => f.row.opportunityScore), [95, 70, 40]);
});

test('a failed run is recorded and nothing is marked seen', async (t) => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });

    const db = fakeDb();
    stubFetch(null, { status: 500 });

    await assert.rejects(
        () => runSignal({ id: 1, source: 'website-gap-finder', input: {} }, { db, token: 't' }),
        SignalRunError
    );
    assert.equal(db.calls.finished.status, 'error');
    assert.equal(db.calls.commits.length, 0, 'marked rows seen despite failing');
    assert.equal(db.seen.size, 0);
});

test('a 4xx is not retryable but a 429 is', async (t) => {
    const original = globalThis.fetch;
    t.after(() => { globalThis.fetch = original; });

    for (const [status, retryable] of [[400, false], [404, false], [429, true], [503, true]]) {
        stubFetch(null, { status });
        await runSignal({ id: 1, source: 'website-gap-finder', input: {} }, { db: fakeDb(), token: 't' })
            .then(() => assert.fail(`expected ${status} to throw`))
            .catch((e) => assert.equal(e.retryable, retryable, `wrong retryable for ${status}`));
    }
});

test('an unknown source or missing token fails before spending an actor run', async () => {
    await assert.rejects(
        () => runSignal({ id: 1, source: 'nope', input: {} }, { db: fakeDb(), token: 't' }),
        /Unknown source/
    );
    await assert.rejects(
        () => runSignal({ id: 1, source: 'website-gap-finder', input: {} }, { db: fakeDb(), token: null }),
        /APIFY_TOKEN/
    );
});

test('isKnownSource guards what a customer can save', () => {
    assert.equal(isKnownSource('website-gap-finder'), true);
    assert.equal(isKnownSource('constructor'), false, 'prototype keys must not pass as sources');
    assert.equal(isKnownSource('__proto__'), false);
});
