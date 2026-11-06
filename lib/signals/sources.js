// The lead-gen actors a customer can build a signal on.
//
// A signal is a saved search over one of these. What makes it worth paying for
// is not the search — anyone can run the actor — it's that we remember what we
// already showed you and only surface what is new. That memory needs a stable
// identity for every row, which is what `fingerprint` provides: the same
// business seen next week has to produce the same string it produced today,
// even if its score, contact details or audit notes have changed since.
//
// Adding a source means answering three questions: what does its input look
// like, what makes a row the same row, and which fields does a human read.

import { runInput } from './gapFinder.js';

// A domain is the most stable thing most of these rows carry, but it arrives
// in every shape going: with and without a scheme, with and without `www.`, a
// trailing slash, a path, mixed case. Normalising matters more than it looks —
// two spellings of one domain means the customer sees the same lead twice and
// stops trusting the feed.
export function normalizeDomain(value) {
    if (typeof value !== 'string') return null;
    let v = value.trim().toLowerCase();
    if (!v) return null;
    v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // scheme
    v = v.replace(/^www\./, '');
    v = v.split(/[/?#]/)[0]; // path, query, fragment
    v = v.replace(/:\d+$/, ''); // port
    v = v.replace(/\.$/, ''); // root label dot
    return v || null;
}

function str(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

// Falls back through candidate keys, so a source that renames a field between
// actor versions does not silently start emitting everything as new.
function firstOf(row, keys) {
    for (const k of keys) {
        const v = str(row[k]);
        if (v) return v;
    }
    return null;
}

// Since 2026-11-06 Tidefeed sells one thing, web design leads, so Website Gap Finder is the only source. (The
// hiring and buying-signal sources pointed at actors that were unpublished on 2026-10-25.)
export const SOURCES = {
    'website-gap-finder': {
        actor: 'm_ctim~website-gap-finder',
        label: 'Web design leads',
        // What the customer is really buying: businesses whose site is bad
        // enough to sell against, in a place they can service.
        blurb: 'Local businesses with no website, or one that is broken or dated enough to pitch against.',
        defaultInput: { extractContacts: true },
        // Adds this run's cap and the signal's own "already returned" list in Gap Finder (see gapFinder.js).
        prepareInput: runInput,
        // A place is the same place forever; its website and score are not.
        fingerprint: (row) =>
            firstOf(row, ['placeId']) ||
            normalizeDomain(row.websiteUrl) ||
            [str(row.name), str(row.city)].filter(Boolean).join('|') ||
            null,
        // Ordered worst-first, because the whole point is "who should I call".
        rank: (row) => (typeof row.opportunityScore === 'number' ? -row.opportunityScore : 0),
        display: ['name', 'city', 'opportunityScore', 'websiteStatus', 'opportunityReasons', 'pitchAngle', 'phone', 'publicEmail', 'mapsUrl'],
    },
};

export function getSource(key) {
    return SOURCES[key] ?? null;
}

export function isKnownSource(key) {
    return Object.hasOwn(SOURCES, key);
}

export function listSources() {
    return Object.entries(SOURCES).map(([key, s]) => ({
        key,
        label: s.label,
        blurb: s.blurb,
        display: s.display,
    }));
}
