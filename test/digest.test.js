import { test } from 'node:test';
import assert from 'node:assert/strict';
import { digestRecipients, weekOf, emailConfig, sendDigest, EmailSendError } from '../lib/signals/digest.js';
import { renderDigest } from '../lib/signals/email.js';

test('a search goes to the addresses it names, cleaned and without repeats', () => {
    const to = digestRecipients({
        deliver_to: [' Ann@Studio.co ', 'ann@studio.co', 'not-an-email', 'bob@agency.com'],
        account_email: 'owner@x.com',
    });
    assert.deepEqual(to, ['Ann@Studio.co', 'bob@agency.com']);
});

test('a search with nobody listed falls back to the account email', () => {
    assert.deepEqual(digestRecipients({ deliver_to: [], account_email: 'owner@x.com' }), ['owner@x.com']);
    assert.deepEqual(digestRecipients({ deliver_to: null, account_email: 'owner@x.com' }), ['owner@x.com']);
});

test('no usable address at all means no recipients, not a crash', () => {
    assert.deepEqual(digestRecipients({ deliver_to: [], account_email: '' }), []);
    assert.deepEqual(digestRecipients({}), []);
});

test('recipients are capped so one row cannot become a mailing list', () => {
    const many = Array.from({ length: 12 }, (_, i) => `p${i}@x.com`);
    assert.equal(digestRecipients({ deliver_to: many }).length, 5);
});

test('every day of a week maps to that week\'s Monday', () => {
    assert.equal(weekOf(new Date('2026-11-23T07:00:00Z')), '2026-11-23'); // Monday
    assert.equal(weekOf(new Date('2026-11-25T12:00:00Z')), '2026-11-23'); // Wednesday
    assert.equal(weekOf(new Date('2026-11-29T23:59:00Z')), '2026-11-23'); // Sunday
    assert.equal(weekOf(new Date('2026-11-30T00:00:00Z')), '2026-11-30'); // next Monday
});

test('email is only configured when both the key and the sender are set', () => {
    assert.equal(emailConfig({}), null);
    assert.equal(emailConfig({ RESEND_API_KEY: 're_x' }), null);
    assert.equal(emailConfig({ EMAIL_FROM: 'Tidefeed <a@b.com>' }), null);
    assert.deepEqual(emailConfig({ RESEND_API_KEY: ' re_x ', EMAIL_FROM: 'Tidefeed <a@b.com>' }), {
        apiKey: 're_x',
        from: 'Tidefeed <a@b.com>',
    });
});

test('sending posts the right request to Resend', async () => {
    let seen;
    const fakeFetch = async (url, init) => {
        seen = { url, init };
        return { ok: true, status: 200, json: async () => ({ id: 'em_1' }) };
    };
    const id = await sendDigest(
        {
            config: { apiKey: 're_test', from: 'Tidefeed <leads@example.com>' },
            to: ['ann@studio.co'],
            subject: '3 new leads for Denver plumbers',
            html: '<p>hi</p>',
            text: 'hi',
            idempotencyKey: 'digest-7-2026-11-23',
        },
        fakeFetch
    );
    assert.equal(id, 'em_1');
    assert.equal(seen.url, 'https://api.resend.com/emails');
    assert.equal(seen.init.method, 'POST');
    assert.equal(seen.init.headers.Authorization, 'Bearer re_test');
    assert.equal(seen.init.headers['Idempotency-Key'], 'digest-7-2026-11-23');
    assert.deepEqual(JSON.parse(seen.init.body), {
        from: 'Tidefeed <leads@example.com>',
        to: ['ann@studio.co'],
        subject: '3 new leads for Denver plumbers',
        html: '<p>hi</p>',
        text: 'hi',
    });
});

test('a refused send says why, and only rate limits and outages are retryable', async () => {
    const answer = (status, body) => async () => ({ ok: false, status, json: async () => body });
    const args = { config: { apiKey: 'k', from: 'f' }, to: ['a@b.co'], subject: 's', html: 'h', text: 't', idempotencyKey: 'x' };

    await assert.rejects(sendDigest(args, answer(403, { message: 'The domain is not verified' })), (error) => {
        assert.ok(error instanceof EmailSendError);
        assert.match(error.message, /403: The domain is not verified/);
        assert.equal(error.retryable, false);
        return true;
    });
    await assert.rejects(sendDigest(args, answer(429, {})), (error) => error.retryable === true);
    await assert.rejects(sendDigest(args, answer(503, {})), (error) => error.retryable === true);
});

test('every digest says why it arrived and how to stop it', () => {
    const { html, text } = renderDigest({ signal: { name: 'Denver plumbers', source: 'website-gap-finder' }, matches: [] });
    assert.match(html, /because you saved this search on Tidefeed/);
    assert.match(text, /pause the search in your dashboard/);
});
