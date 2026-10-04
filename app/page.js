import Link from 'next/link';
import { getActorCatalog, getPortfolioCount } from '@/lib/actors.js';
import ActorCard from '@/components/ActorCard.js';
import { SOCIAL_LINKS } from '@/lib/social.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, jsonLd, pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/', absoluteTitle: true });

function catalogSchema(actors) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${SITE_NAME} public data APIs`,
        itemListElement: actors.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'SoftwareApplication',
                name: a.title,
                description: a.description,
                url: a.url,
                applicationCategory: 'DeveloperApplication',
                operatingSystem: 'Web',
                publisher: { '@id': `${SITE_URL}/#org` },
                ...(a.priceUsd != null && {
                    offers: { '@type': 'Offer', price: String(a.priceUsd), priceCurrency: 'USD' },
                }),
            },
        })),
    };
}

function faqSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
        })),
    };
}

/* --- Icons --- */

const svg = (props) => ({
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
});

const CheckIcon = (
    <svg {...svg({ width: 16, height: 16 })} aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const MinusIcon = (
    <svg {...svg({ width: 16, height: 16 })} aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const ChevronIcon = (
    <svg {...svg({ width: 18, height: 18 })} className="faq-item__chevron" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const ICONS = {
    shield: (
        <svg {...svg({ width: 21, height: 21 })} aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    ),
    tag: (
        <svg {...svg({ width: 21, height: 21 })} aria-hidden="true">
            <path d="M3 3h8l10 10-8 8L3 11V3z" />
            <circle cx="7.5" cy="7.5" r="1.15" fill="currentColor" stroke="none" />
        </svg>
    ),
    code: (
        <svg {...svg({ width: 21, height: 21 })} aria-hidden="true">
            <polyline points="9 6 3 12 9 18" />
            <polyline points="15 6 21 12 15 18" />
        </svg>
    ),
    log: (
        <svg {...svg({ width: 21, height: 21 })} aria-hidden="true">
            <circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
            <line x1="9" y1="6" x2="21" y2="6" />
            <line x1="9" y1="12" x2="21" y2="12" />
            <line x1="9" y1="18" x2="21" y2="18" />
        </svg>
    ),
};

/* --- Content --- */

const FEATURES = [
    {
        icon: 'shield',
        title: 'Public data, played straight',
        desc: 'Official public APIs and open government data. No proxies, nothing that works around bot protection, and no actor logs in to anything or asks for your passwords. When a page has to be read directly, robots.txt is respected.',
    },
    {
        icon: 'tag',
        title: 'You see the price first',
        desc: 'Every actor costs $0.007 per event, $7 per 1,000. No subscription, no seats, no minimum. Many charge once per search rather than per row, so a search returning 50 results still costs $0.007.',
    },
    {
        icon: 'code',
        title: 'Source included',
        desc: 'Every actor ships with its code on GitHub. Read how it works, fork it, or check exactly which endpoints it touches before you spend anything.',
    },
    {
        icon: 'log',
        title: 'Built in public',
        desc: 'A running log of what shipped, what broke, and what the data source did that its own docs never mentioned.',
    },
];

const STEPS = [
    {
        title: 'Pick a feed',
        desc: 'Browse the catalog by what you actually need: recalls, grants, filings, court opinions, security advisories, weather. Each one lists its source and its price up front.',
    },
    {
        title: 'Try it in the browser',
        desc: 'Most feeds have a live demo page. Run a real query against the real source, see the real shape of the data, and spend nothing doing it.',
    },
    {
        title: 'Run it on Apify',
        desc: 'Open the actor on Apify and run it with your own input, on demand or on a schedule. Nothing to install and no server of your own to keep alive.',
    },
    {
        title: 'Take the JSON',
        desc: 'Results land in a dataset you can read over the API or export as JSON, CSV or Excel. Wire it into whatever you were going to build anyway.',
    },
];

const EXPECT_YES = [
    'Structured JSON from sources that publish it openly',
    'A price you can see before you run anything',
    'Code on GitHub for every actor in the catalog',
    'Live demo pages for most of the catalog',
];

const EXPECT_NO = [
    'Data from behind a login, a paywall or a bot wall',
    'Scraped personal data or anything a source forbids',
    'A monthly subscription or a per-seat plan',
    'An SLA — these are small tools, run as such',
];

const FAQ = [
    {
        q: 'What does it actually cost?',
        a: 'Every actor in the portfolio charges $0.007 per event, which works out to $7 per 1,000. There is no subscription and no seat cost. Many actors charge once per search rather than once per result row, so a query that returns fifty records still costs a single $0.007 event.',
    },
    {
        q: 'Do I need an account to try one?',
        a: 'Not for the live demos. The demo pages on this site run a real query against the real data source in your browser, capped to a few free runs a day for everyone. To run an actor with your own input or on a schedule you will need an Apify account, because that is the platform the actors run on.',
    },
    {
        q: 'Where does the data come from?',
        a: 'Official public APIs and open government data: the FDA, FEMA, USAspending, the SEC, CourtListener, the NWS, USGS, GitHub Security Advisories, and similar sources. Each actor names its source in its README and on its Apify page.',
    },
    {
        q: 'Do these scrape sites or use proxies?',
        a: 'No. Nothing in the portfolio uses proxies, works around bot protection, or logs in to anything. Where an actor reads a page directly rather than calling an API, it checks robots.txt first. Any source that would need an account or a key the user has to create is left out of the catalog.',
    },
    {
        q: 'Can I see the code?',
        a: 'Yes, all of it. Every actor has a public GitHub repository under the same name as its Apify slug, linked from its card in the catalog.',
    },
    {
        q: 'How fresh is the data?',
        a: 'Each run fetches from the source at the moment you run it, so the data is as current as the source makes it. How often a source itself updates varies: some publish continuously, others on a daily or weekly schedule.',
    },
    {
        q: 'Can you build one for a source I need?',
        a: 'Often, yes, as long as the source is public and does not require an account, a proxy or anything that works around bot protection. The build log tracks what is shipping next and the GitHub profile is the quickest way to get in touch.',
    },
];

/* --- Helpers --- */

function formatPrice(value) {
    return value < 0.01 ? `$${value.toFixed(3)}` : `$${value.toFixed(2)}`;
}

function formatPriceRange(min, max) {
    return min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`;
}

export default async function HomePage() {
    const [actors, portfolioCount] = await Promise.all([getActorCatalog(), getPortfolioCount()]);
    const liveCount = portfolioCount ?? actors.length;
    const prices = actors.map((a) => a.priceUsd).filter((p) => p != null);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;
    const priceLabel = minPrice != null ? formatPriceRange(minPrice, maxPrice) : '$0.007';

    // The hero card shows a real catalog entry rather than a mock-up — prefer one
    // that has both a demo to link to and a live price to show.
    const showcase =
        actors.find((a) => a.demoPath && a.priceUsd != null) ?? actors.find((a) => a.demoPath) ?? null;
    const demoCount = actors.filter((a) => a.demoPath).length;

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(catalogSchema(actors))} />
            <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(FAQ))} />

            {/* ---------- Hero ---------- */}
            <section className="landing-hero">
                <div className="deco-grid" aria-hidden="true" />
                <div className="deco-orb deco-orb--top" aria-hidden="true" />
                <div className="deco-orb deco-orb--right" aria-hidden="true" />

                <div className="wrap hero-grid">
                    <div>
                        <p className="badge rise" style={{ '--i': 0 }}>
                            <span className="badge__dot" aria-hidden="true" />
                            {liveCount} actors live on Apify
                        </p>
                        <h1 className="hero__title rise" style={{ '--i': 1 }}>
                            Public records in,{' '}
                            <span className="text-grad">clean JSON out.</span>
                        </h1>
                        <p className="hero__lede rise" style={{ '--i': 2 }}>
                            Ready-to-run APIs that turn public data into structured results: FDA
                            recalls, federal grants, court opinions, SEC filings, provider and broker
                            lookups, security advisories and more. Run one on demand, pay {priceLabel} an
                            event, and skip the scraper you were about to write.
                        </p>
                        <div className="hero-ctas rise" style={{ '--i': 3 }}>
                            <Link href="#portfolio" className="cta-btn cta-btn--primary">
                                Browse the catalog
                            </Link>
                            <Link href="#how" className="cta-btn cta-btn--ghost">
                                See how it works
                            </Link>
                        </div>
                        <ul className="trust-row rise" style={{ '--i': 4 }}>
                            <li>{CheckIcon} No subscription</li>
                            <li>{CheckIcon} No proxies, no logins</li>
                            <li>{CheckIcon} Source on GitHub</li>
                        </ul>
                    </div>

                    {showcase && (
                        <div className="hero-visual rise" style={{ '--i': 3 }}>
                            <div className="visual-card drift">
                                <p className="visual-card__eyebrow">
                                    <span>Live demo</span>
                                    {showcase.priceUsd != null && (
                                        <span className="visual-card__price">
                                            {formatPrice(showcase.priceUsd)}/event
                                        </span>
                                    )}
                                </p>
                                <div className="visual-card__row">
                                    <h2 className="visual-card__title">{showcase.title}</h2>
                                </div>
                                <ul className="visual-card__tags">
                                    <li>Runs in your browser</li>
                                    <li>No account</li>
                                    <li>Free to try</li>
                                </ul>
                                <Link href={showcase.demoPath} className="visual-card__cta">
                                    Try it now
                                </Link>
                            </div>

                            <div className="visual-card visual-card--accent drift--slow">
                                <div className="visual-stat visual-stat--lead">
                                    <p className="visual-stat__label">Actors live</p>
                                    <p className="visual-stat__value">{liveCount}</p>
                                </div>
                                <div className="visual-card__split">
                                    <div className="visual-stat">
                                        <p className="visual-stat__label">Per event</p>
                                        <p className="visual-stat__value">{priceLabel}</p>
                                    </div>
                                    <div className="visual-stat">
                                        <p className="visual-stat__label">Subscriptions</p>
                                        <p className="visual-stat__value">Zero</p>
                                    </div>
                                </div>
                            </div>

                            <p className="hero-visual__caption">
                                A real catalog entry and live portfolio numbers, not a mock-up.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ---------- Features ---------- */}
            <section className="band band--alt">
                <div className="wrap">
                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <article className="feature-card" key={f.title} data-reveal style={{ '--i': i }}>
                                <span className="feature-card__icon" aria-hidden="true">
                                    {ICONS[f.icon]}
                                </span>
                                <h2 className="feature-card__title">{f.title}</h2>
                                <p className="feature-card__desc">{f.desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- How it works ---------- */}
            <section className="band" id="how">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">How it works</span>
                        <h2 className="section-title">Four steps, then you have the data.</h2>
                        <p className="section-lede">
                            There is nothing to install and no server to keep alive. Pick a feed, see
                            what it returns, and run it when you need it.
                        </p>
                    </div>

                    <ol className="steps">
                        {STEPS.map((s, i) => (
                            <li className="step" key={s.title} data-reveal style={{ '--i': i }}>
                                <span className="step__num" aria-hidden="true">
                                    {i + 1}
                                </span>
                                <h3 className="step__title">{s.title}</h3>
                                <p className="step__desc">{s.desc}</p>
                            </li>
                        ))}
                    </ol>

                    <p className="callout" data-reveal>
                        <strong>One thing to expect:</strong> these are small, single-purpose tools, not
                        a managed data platform. They fetch from the source at run time, so an actor is
                        only ever as fresh and as available as the public source behind it.
                    </p>
                </div>
            </section>

            {/* ---------- Catalog ---------- */}
            <section className="band band--alt" id="portfolio">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">The catalog</span>
                        <h2 className="section-title">Pick a feed, or see what is next.</h2>
                        <p className="section-lede">
                            {actors.length} featured actors out of {liveCount} live, each one calling an
                            official public source and returning structured results.
                            {demoCount > 0 && ` ${demoCount} of them have a live demo you can run right here.`}
                        </p>
                    </div>

                    <div className="catalog-grid">
                        {actors.map((actor, i) => (
                            <ActorCard actor={actor} revealIndex={i % 8} key={actor.slug} />
                        ))}
                    </div>

                    <div className="portfolio-more">
                        <Link href="/actors" className="cta-btn cta-btn--ghost">
                            Full catalog &amp; live pricing →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ---------- Pricing ---------- */}
            <section className="band" id="pricing">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">What it costs</span>
                        <h2 className="section-title">One price, every actor.</h2>
                        <p className="section-lede">
                            Billing is per event on Apify: you pay for the runs you make and nothing
                            else. No plan to pick, no seats to count, no minimum spend.
                        </p>
                    </div>

                    <div className="price-grid">
                        <article className="price-card price-card--feature" data-reveal style={{ '--i': 0 }}>
                            <div className="price-card__head">
                                <h3 className="price-card__name">Pay per event</h3>
                                <span className="badge">All actors</span>
                            </div>
                            <p className="price-card__amount">$0.007</p>
                            <p className="price-card__unit">per charged event — $7 per 1,000</p>
                            <dl className="price-list">
                                <div>
                                    <dt>Subscription</dt>
                                    <dd>None</dd>
                                </div>
                                <div>
                                    <dt>Seats</dt>
                                    <dd>None</dd>
                                </div>
                                <div>
                                    <dt>Minimum spend</dt>
                                    <dd>None</dd>
                                </div>
                            </dl>
                        </article>

                        <article className="price-card" data-reveal style={{ '--i': 1 }}>
                            <div className="price-card__head">
                                <h3 className="price-card__name">Live demos</h3>
                                <span className="badge">On this site</span>
                            </div>
                            <p className="price-card__amount">Free</p>
                            <p className="price-card__unit">a few runs a day, shared by everyone</p>
                            <dl className="price-list">
                                <div>
                                    <dt>Account needed</dt>
                                    <dd>No</dd>
                                </div>
                                <div>
                                    <dt>Card needed</dt>
                                    <dd>No</dd>
                                </div>
                                <div>
                                    <dt>Demos available</dt>
                                    <dd>{demoCount}</dd>
                                </div>
                            </dl>
                        </article>
                    </div>

                    <div className="rules" data-reveal>
                        <h3 className="rules__title">How the billing works</h3>
                        <ul>
                            <li>
                                {CheckIcon}
                                <span>
                                    A charged event is defined per actor and named in its README. Many
                                    actors charge once per search, so one query that returns fifty rows
                                    is still one event.
                                </span>
                            </li>
                            <li>
                                {CheckIcon}
                                <span>
                                    Billing and payment are handled by Apify against your own account.
                                    Nothing is charged on this site and no card details are collected here.
                                </span>
                            </li>
                            <li>
                                {CheckIcon}
                                <span>
                                    A run that fails before it charges costs nothing. You are not billed
                                    for a source being down.
                                </span>
                            </li>
                            <li>
                                {CheckIcon}
                                <span>
                                    Every actor page on Apify shows its live pricing. If a price ever
                                    changes, that page is the record.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ---------- Expectations ---------- */}
            <section className="band band--alt">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">Straight answers</span>
                        <h2 className="section-title">What this is, and what it is not.</h2>
                        <p className="section-lede">
                            These are small, sharp tools for getting public data out of public sources.
                            They are good at that and deliberately bad at everything else.
                        </p>
                    </div>

                    <div className="expect">
                        <div className="expect-col expect-col--yes" data-reveal style={{ '--i': 0 }}>
                            <h3 className="expect-col__title">You can expect</h3>
                            <ul>
                                {EXPECT_YES.map((item) => (
                                    <li key={item}>
                                        {CheckIcon}
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="expect-col expect-col--no" data-reveal style={{ '--i': 1 }}>
                            <h3 className="expect-col__title">Please do not expect</h3>
                            <ul>
                                {EXPECT_NO.map((item) => (
                                    <li key={item}>
                                        {MinusIcon}
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- FAQ ---------- */}
            <section className="band" id="faq">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">FAQ</span>
                        <h2 className="section-title">Questions people ask first</h2>
                    </div>

                    <div className="faq" data-reveal>
                        {FAQ.map(({ q, a }, i) => (
                            <details className="faq-item" key={q} open={i === 0}>
                                <summary>
                                    {q}
                                    {ChevronIcon}
                                </summary>
                                <p className="faq-item__body">{a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- Closing CTA ---------- */}
            <section className="landing-cta">
                <div className="wrap">
                    <div className="landing-cta__inner" data-reveal>
                        <h2 className="landing-cta__title">Have a specific feed in mind?</h2>
                        <p className="landing-cta__lede">
                            Every actor here started as someone&rsquo;s specific need. Read the source,
                            run a demo, or follow the build log for what is shipping next.
                        </p>
                        <div className="hero-ctas">
                            <Link href="/actors" className="cta-btn cta-btn--primary">
                                Browse the catalog
                            </Link>
                            <a
                                href={SOCIAL_LINKS.github}
                                target="_blank"
                                rel="noreferrer"
                                className="cta-btn cta-btn--ghost"
                            >
                                See the code
                            </a>
                        </div>
                        <p className="landing-cta__note">
                            Public sources only · $0.007 per event · No proxies, no logins
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
