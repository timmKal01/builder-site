import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDigest, subjectFor } from '../lib/signals/email.js';

const signal = { name: 'Nairobi salons, no website', source: 'website-gap-finder' };

function match(payload) {
    return { fingerprint: payload.placeId ?? 'x', payload };
}

test('the subject says how many, and reads right for one', () => {
    assert.equal(subjectFor(signal, 3), '3 new leads for Nairobi salons, no website');
    assert.equal(subjectFor(signal, 1), '1 new lead for Nairobi salons, no website');
    assert.equal(subjectFor(signal, 0), 'No new leads for Nairobi salons, no website');
});

test('an empty digest still says something useful', () => {
    const { html, text } = renderDigest({ signal, matches: [] });
    assert.match(html, /Nothing new this time/);
    assert.match(text, /Nothing new this time/);
    assert.doesNotMatch(html, /<table/, 'rendered an empty table');
});

test('the digest shows the fields that source is meant to show', () => {
    const { html } = renderDigest({
        signal,
        matches: [match({ placeId: 'a', name: 'Glow Salon', city: 'Nairobi', opportunityScore: 88, pitchAngle: 'No website at all' })],
    });
    assert.match(html, /Glow Salon/);
    assert.match(html, /Nairobi/);
    assert.match(html, /88/);
    assert.match(html, /No website at all/);
    assert.match(html, /Opportunity Score/, 'field labels should be humanised');
});

test('lead data cannot break out of the markup', () => {
    // Business names come from scraped pages. A quote or an angle bracket is
    // ordinary rather than an attack, but either way it must not escape.
    const nasty = '"><script>alert(1)</script>';
    const { html, text } = renderDigest({ signal, matches: [match({ placeId: 'a', name: nasty })] });

    assert.doesNotMatch(html, /<script>/, 'raw script tag reached the HTML');
    assert.match(html, /&lt;script&gt;/, 'the name should be escaped, not dropped');
    assert.match(text, /<script>/, 'the plain-text part needs no escaping');
});

test('the signal name is escaped too', () => {
    const hostile = { name: '<img src=x onerror=alert(1)>', source: 'website-gap-finder' };
    const { html } = renderDigest({ signal: hostile, matches: [] });
    assert.doesNotMatch(html, /<img src=x/);
    assert.match(html, /&lt;img src=x/);
});

test('long digests are truncated with a pointer to the dashboard', () => {
    const matches = Array.from({ length: 40 }, (_, i) => match({ placeId: `p${i}`, name: `Salon ${i}` }));
    const { html } = renderDigest({ signal, matches, dashboardUrl: 'https://tidefeed.vercel.app/app' });

    assert.match(html, /15 more in the dashboard/);
    assert.match(html, /Salon 0/);
    assert.doesNotMatch(html, /Salon 39/, 'rendered past the row cap');
});

test('held-back rows are explained, so a capped plan does not look broken', () => {
    const { html, text } = renderDigest({ signal, matches: [match({ placeId: 'a' })], held: 15 });
    assert.match(html, /15 more match(es)? held for your next run/);
    assert.match(text, /15 more held for your next run/);
});

test('nothing is said about held rows when none are held', () => {
    const { html } = renderDigest({ signal, matches: [match({ placeId: 'a' })], held: 0 });
    assert.doesNotMatch(html, /held for your next run/);
});

test('missing and awkward values render as a dash rather than undefined', () => {
    const { html, text } = renderDigest({
        signal,
        matches: [match({ placeId: 'a', name: null, city: '', opportunityScore: 0 })],
    });
    assert.doesNotMatch(html, /undefined|null/);
    assert.doesNotMatch(text, /undefined/);
    assert.match(html, /—/);
});

test('arrays and objects are flattened instead of printing [object Object]', () => {
    const { html } = renderDigest({
        signal: { name: 'Stack watch', source: 'tech-stack-lead-finder' },
        matches: [{ fingerprint: 'a', payload: { url: 'acme.co.ke', techStack: ['WooCommerce', 'jQuery'] } }],
    });
    assert.match(html, /WooCommerce, jQuery/);
    assert.doesNotMatch(html, /\[object Object\]/);
});

test('the dashboard button only appears when there is a url', () => {
    const withUrl = renderDigest({ signal, matches: [], dashboardUrl: 'https://example.com/app' });
    const without = renderDigest({ signal, matches: [] });
    assert.match(withUrl.html, /Open the dashboard/);
    assert.doesNotMatch(without.html, /Open the dashboard/);
});
