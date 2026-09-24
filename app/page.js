import Link from 'next/link';
import { getActorCatalog, getPortfolioCount } from '@/lib/actors.js';
import ActorCard from '@/components/ActorCard.js';
import { SOCIAL_LINKS } from '@/lib/social.js';

export const metadata = {
    title: { absolute: "Tim's Actors — small data tools, built in public" },
    description:
        'A portfolio of Apify actors turning public data into clean JSON. No subscriptions: $0.007 per event, which is $7 per 1,000. No proxies, no logins.',
};

const ICONS = {
    bolt: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />
        </svg>
    ),
    tag: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h8l10 10-8 8L3 11V3z" />
            <circle cx="7.5" cy="7.5" r="1.15" fill="currentColor" stroke="none" />
        </svg>
    ),
    code: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 3 12 9 18" />
            <polyline points="15 6 21 12 15 18" />
        </svg>
    ),
    log: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
            <line x1="9" y1="6" x2="21" y2="6" />
            <line x1="9" y1="12" x2="21" y2="12" />
            <line x1="9" y1="18" x2="21" y2="18" />
        </svg>
    ),
};

const FEATURES = [
    {
        icon: 'bolt',
        title: 'Public data, played straight',
        desc: "Official public APIs and open government data. No proxies, nothing that works around bot protection, and no actor logs in to anything or asks for your passwords. When a page has to be read directly, robots.txt is respected.",
    },
    {
        icon: 'tag',
        title: '$7 per 1,000',
        desc: 'Every actor costs $0.007 per event. No subscriptions, no seats. Many charge once per search rather than per row, so a search that returns 50 results still costs $0.007.',
    },
    {
        icon: 'code',
        title: 'Source included',
        desc: 'Every actor ships with its code on GitHub. Read how it works, fork it, or check exactly what data it touches.',
    },
    {
        icon: 'log',
        title: 'Built in public',
        desc: "A running log of what shipped, what broke, and what the data source did that the docs never mentioned.",
    },
];

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

    return (
        <>
            <section className="landing-hero">
                <div className="wrap">
                    <p className="hero__eyebrow" data-reveal style={{ '--i': 0 }}>
                        the portfolio
                    </p>
                    <h1 className="hero__title landing-hero__title" data-reveal style={{ '--i': 1 }}>
                        Small, sharp data tools — priced per run, not per seat.
                    </h1>
                    <p className="hero__lede landing-hero__lede" data-reveal style={{ '--i': 2 }}>
                        {liveCount} Apify actors turning public data into clean JSON: company
                        signals, hiring activity, tech stacks, security alerts, and more. Each one
                        runs on demand and returns structured results in seconds.
                    </p>
                    <div className="hero-ctas" data-reveal style={{ '--i': 3 }}>
                        <Link href="#portfolio" className="cta-btn cta-btn--primary">
                            Browse the actors
                        </Link>
                        <Link href="/log" className="cta-btn cta-btn--ghost">
                            Read the build log
                        </Link>
                    </div>
                    <dl className="stat-bar" data-reveal style={{ '--i': 4 }}>
                        <div className="stat">
                            <dt>Actors live</dt>
                            <dd>{liveCount}</dd>
                        </div>
                        {minPrice != null && (
                            <div className="stat">
                                <dt>Per event</dt>
                                <dd>{formatPriceRange(minPrice, maxPrice)}</dd>
                            </div>
                        )}
                        <div className="stat">
                            <dt>Subscriptions</dt>
                            <dd>Zero</dd>
                        </div>
                    </dl>
                </div>
            </section>

            <section className="features">
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

            <section className="portfolio" id="portfolio">
                <div className="wrap">
                    <div className="catalog-intro">
                        <p className="hero__eyebrow" data-reveal style={{ '--i': 0 }}>
                            the catalog
                        </p>
                        <h2 className="hero__title" data-reveal style={{ '--i': 1 }}>
                            Pick a feed, or see what&rsquo;s next.
                        </h2>
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

            <section className="landing-cta">
                <div className="wrap">
                    <div className="landing-cta__inner" data-reveal>
                        <h2 className="landing-cta__title">Have a specific feed in mind?</h2>
                        <p className="landing-cta__lede">
                            Every actor here started as someone&rsquo;s specific need. Check the source,
                            or watch the build log for what&rsquo;s shipping next.
                        </p>
                        <div className="hero-ctas">
                            <a
                                href={SOCIAL_LINKS.github}
                                target="_blank"
                                rel="noreferrer"
                                className="cta-btn cta-btn--primary"
                            >
                                See the code
                            </a>
                            <Link href="/log" className="cta-btn cta-btn--ghost">
                                Read the build log
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
