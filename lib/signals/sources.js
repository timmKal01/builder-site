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

export const SOURCES = {
    'website-gap-finder': {
        actor: 'm_ctim~website-gap-finder',
        label: 'Local businesses with a website gap',
        // What the customer is really buying: businesses whose site is bad
        // enough to sell against, in a place they can service.
        blurb: 'Local businesses whose website is missing, broken, or dated enough to pitch against.',
        defaultInput: { extractContacts: true },
        // A place is the same place forever; its website and score are not.
        fingerprint: (row) =>
            firstOf(row, ['placeId']) ||
            normalizeDomain(row.websiteUrl) ||
            [str(row.name), str(row.city)].filter(Boolean).join('|') ||
            null,
        // Ordered worst-first, because the whole point is "who should I call".
        rank: (row) => (typeof row.opportunityScore === 'number' ? -row.opportunityScore : 0),
        display: ['name', 'city', 'opportunityScore', 'pitchAngle', 'phone', 'publicEmail', 'whatsapp'],
    },

    'tech-stack-lead-finder': {
        actor: 'm_ctim~tech-stack-lead-finder',
        label: 'Sites running a given stack',
        blurb: 'Sites running the platform you sell against, so you can pitch the migration.',
        defaultInput: {},
        fingerprint: (row) => normalizeDomain(row.url || row.website || row.domain),
        rank: () => 0,
        display: ['url', 'matched', 'techStack', 'email', 'phone'],
    },

    'company-hiring-tracker': {
        actor: 'm_ctim~company-hiring-tracker',
        label: 'Companies hiring for a role',
        // Hiring is the sharpest trigger in the set: a company posting for a
        // Shopify developer has budget and intent this month, not in general.
        blurb: 'Companies posting roles that imply they are about to spend on what you sell.',
        defaultInput: {},
        // One company can post the same role twice; the posting URL is the
        // thing that is genuinely unique, with the tuple as a fallback.
        fingerprint: (row) =>
            firstOf(row, ['jobUrl', 'url', 'absolute_url']) ||
            [normalizeDomain(row.companyDomain || row.company), str(row.title)].filter(Boolean).join('|') ||
            null,
        rank: () => 0,
        display: ['company', 'title', 'location', 'jobUrl', 'postedAt'],
    },

    'company-buying-signal-report': {
        actor: 'm_ctim~company-buying-signal-report',
        label: 'Buying signals for a domain list',
        blurb: 'One scored sales-trigger row per company: hiring, stack, and best contact.',
        defaultInput: {},
        fingerprint: (row) => normalizeDomain(row.domain || row.company || row.website),
        rank: (row) => (typeof row.buyingSignalScore === 'number' ? -row.buyingSignalScore : 0),
        display: ['domain', 'buyingSignalScore', 'openRoles', 'techStack', 'bestContact'],
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
