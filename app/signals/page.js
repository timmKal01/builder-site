import Link from 'next/link';
import { listSources } from '@/lib/signals/sources.js';
import { PLANS, PRICES, formatPrice } from '@/lib/signals/plans.js';
import { SITE_URL, jsonLd, pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({
    title: 'Lead Signals: Saved Searches That Only Show You What Is New',
    description:
        'Saved searches over local business and company data that run on a schedule and surface only leads you have not seen before. From $49 or KES 2,500 a month.',
    path: '/signals',
});

const svg = (p) => ({
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...p,
});

const Check = (
    <svg {...svg({ width: 16, height: 16 })} aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const Minus = (
    <svg {...svg({ width: 16, height: 16 })} aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const Chevron = (
    <svg {...svg({ width: 18, height: 18 })} className="faq-item__chevron" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const STEPS = [
    {
        title: 'Describe what you sell to',
        desc: 'Local businesses with a weak website, companies hiring for a role you build for, sites running the platform you migrate people off. Whatever your version of a good lead looks like.',
    },
    {
        title: 'It runs on a schedule',
        desc: 'Weekly, or daily on a paid plan. You do not open anything, press anything, or remember anything.',
    },
    {
        title: 'You only see what is new',
        desc: 'Every business it has already shown you is remembered. Run it fifty times and you never see the same lead twice.',
    },
    {
        title: 'You call them',
        desc: 'Each lead carries what is wrong, a score, and a public contact where one is listed. That is the part we cannot do for you.',
    },
];

const YES = [
    'Leads you have not already been shown',
    'Public contact details where the business lists them',
    'A score and the reasons behind it, not a raw dump',
    'A price in your own currency',
];

const NO = [
    'A database you can export in one go',
    'Personal data, or anything behind a login',
    'Verified or enriched email addresses',
    'Leads nobody else could ever find',
];

const FAQ = [
    {
        q: 'What makes this different from running the search myself?',
        a: 'Memory. Any tool can give you a list today, and most of that list is the same as yesterday. A signal records every business it has ever shown you and surfaces only the rest, so what arrives is always worth reading. That is the whole product.',
    },
    {
        q: 'Where does the data come from?',
        a: 'The same public sources behind the pay-per-use catalog: business listings, public company pages, job boards and the sites themselves. Nothing comes from behind a login, and nothing works around bot protection.',
    },
    {
        q: 'How do I pay from Kenya?',
        a: 'In shillings, by M-Pesa or card. The Kenyan price is set for the Kenyan market rather than converted from the dollar price, because a straight conversion would be the wrong number locally. International customers pay in dollars by card.',
    },
    {
        q: 'What happens if I stop paying?',
        a: 'You drop back to the free plan rather than losing access. One weekly signal keeps running, and anything held back while you were away is still waiting if you come back.',
    },
    {
        q: 'Can I try it without a card?',
        a: 'Yes. The free plan is one saved search, run weekly, with a capped number of new leads each run. No card, and nothing expires.',
    },
    {
        q: 'Is there a contract?',
        a: 'No. Pay monthly or quarterly, stop whenever. Quarterly is a little cheaper, mostly because it means fewer renewals to think about.',
    },
];

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

export default function SignalsPage() {
    const sources = listSources();
    const price = (currency, interval) => formatPrice(PRICES.pro[currency][interval], currency);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(FAQ))} />

            {/* ---------- Hero ---------- */}
            <section className="landing-hero">
                <div className="deco-grid" aria-hidden="true" />
                <div className="deco-orb deco-orb--top" aria-hidden="true" />

                <div className="wrap">
                    <p className="badge rise" style={{ '--i': 0 }}>
                        <span className="badge__dot" aria-hidden="true" />
                        Free plan, no card
                    </p>
                    <h1 className="hero__title rise" style={{ '--i': 1 }}>
                        The same list every week{' '}
                        <span className="text-grad">is not a lead list.</span>
                    </h1>
                    <p className="hero__lede rise" style={{ '--i': 2 }}>
                        Save a search once. It runs on a schedule and shows you only the businesses it
                        has never shown you before. No scrolling past the forty you already called.
                    </p>
                    <div className="hero-ctas rise" style={{ '--i': 3 }}>
                        <Link href="/sign-up" className="cta-btn cta-btn--primary">
                            Start free
                        </Link>
                        <Link href="#pricing" className="cta-btn cta-btn--ghost">
                            See the price
                        </Link>
                    </div>
                    <ul className="trust-row rise" style={{ '--i': 4 }}>
                        <li>{Check} One search free, forever</li>
                        <li>{Check} Pay in KES or USD</li>
                        <li>{Check} Cancel whenever</li>
                    </ul>
                </div>
            </section>

            {/* ---------- The idea ---------- */}
            <section className="band band--alt">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">The idea</span>
                        <h2 className="section-title">A list goes stale. A feed does not.</h2>
                        <p className="section-lede">
                            Pull a list of businesses twice a week and most of the second list is the
                            first list. The work is not finding them, it is working out which ones are
                            new. A signal does that bit.
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
                        <strong>Where it lands today:</strong> new matches collect in your dashboard,
                        ready to work through. Email digests are being wired up next, so for now
                        you go and look rather than being told.
                    </p>
                </div>
            </section>

            {/* ---------- Sources ---------- */}
            <section className="band" id="sources">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">What you can watch</span>
                        <h2 className="section-title">Four things worth being told about.</h2>
                        <p className="section-lede">
                            Each one is a different reason a business is about to spend money. Pick the
                            one that matches what you sell.
                        </p>
                    </div>

                    <div className="features-grid">
                        {sources.map((s, i) => (
                            <article className="feature-card" key={s.key} data-reveal style={{ '--i': i }}>
                                <h3 className="feature-card__title">{s.label}</h3>
                                <p className="feature-card__desc">{s.blurb}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- Pricing ---------- */}
            <section className="band band--alt" id="pricing">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">Price</span>
                        <h2 className="section-title">Priced for where you are.</h2>
                        <p className="section-lede">
                            The Kenyan price is set for Kenya, not converted from the dollar one. A
                            conversion would be the wrong number in at least one of the two markets.
                        </p>
                    </div>

                    <div className="price-grid">
                        <article className="price-card" data-reveal style={{ '--i': 0 }}>
                            <div className="price-card__head">
                                <h3 className="price-card__name">Free</h3>
                                <span className="badge">No card</span>
                            </div>
                            <p className="price-card__amount">0</p>
                            <p className="price-card__unit">one saved search, weekly</p>
                            <dl className="price-list">
                                <div>
                                    <dt>Saved searches</dt>
                                    <dd>{PLANS.free.signals}</dd>
                                </div>
                                <div>
                                    <dt>New leads per run</dt>
                                    <dd>up to {PLANS.free.maxNewPerRun}</dd>
                                </div>
                                <div>
                                    <dt>Expires</dt>
                                    <dd>never</dd>
                                </div>
                            </dl>
                        </article>

                        <article className="price-card price-card--feature" data-reveal style={{ '--i': 1 }}>
                            <div className="price-card__head">
                                <h3 className="price-card__name">Pro</h3>
                                <span className="badge">Kenya</span>
                            </div>
                            <p className="price-card__amount">{price('KES', 'monthly')}</p>
                            <p className="price-card__unit">
                                a month, or {price('KES', 'quarterly')} a quarter · M-Pesa or card
                            </p>
                            <dl className="price-list">
                                <div>
                                    <dt>Saved searches</dt>
                                    <dd>{PLANS.pro.signals}</dd>
                                </div>
                                <div>
                                    <dt>New leads per run</dt>
                                    <dd>up to {PLANS.pro.maxNewPerRun}</dd>
                                </div>
                                <div>
                                    <dt>Runs</dt>
                                    <dd>daily or weekly</dd>
                                </div>
                            </dl>
                        </article>

                        <article className="price-card price-card--feature" data-reveal style={{ '--i': 2 }}>
                            <div className="price-card__head">
                                <h3 className="price-card__name">Pro</h3>
                                <span className="badge">International</span>
                            </div>
                            <p className="price-card__amount">{price('USD', 'monthly')}</p>
                            <p className="price-card__unit">
                                a month, or {price('USD', 'quarterly')} a quarter · card
                            </p>
                            <dl className="price-list">
                                <div>
                                    <dt>Saved searches</dt>
                                    <dd>{PLANS.pro.signals}</dd>
                                </div>
                                <div>
                                    <dt>New leads per run</dt>
                                    <dd>up to {PLANS.pro.maxNewPerRun}</dd>
                                </div>
                                <div>
                                    <dt>Runs</dt>
                                    <dd>daily or weekly</dd>
                                </div>
                            </dl>
                        </article>
                    </div>

                    <div className="rules" data-reveal>
                        <h3 className="rules__title">How the plan behaves</h3>
                        <ul>
                            <li>
                                {Check}
                                <span>
                                    Stop paying and you drop to the free plan rather than losing
                                    access. One weekly search keeps running.
                                </span>
                            </li>
                            <li>
                                {Check}
                                <span>
                                    Leads held back by a plan&rsquo;s per-run cap are not thrown away.
                                    They arrive on the next run, highest-scoring first.
                                </span>
                            </li>
                            <li>
                                {Check}
                                <span>
                                    Quarterly is a little cheaper, mostly because it means fewer
                                    renewals to think about.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ---------- Expectations ---------- */}
            <section className="band">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">Straight answers</span>
                        <h2 className="section-title">What arrives, and what does not.</h2>
                    </div>

                    <div className="expect">
                        <div className="expect-col expect-col--yes" data-reveal style={{ '--i': 0 }}>
                            <h3 className="expect-col__title">You get</h3>
                            <ul>
                                {YES.map((item) => (
                                    <li key={item}>
                                        {Check}
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="expect-col expect-col--no" data-reveal style={{ '--i': 1 }}>
                            <h3 className="expect-col__title">You do not get</h3>
                            <ul>
                                {NO.map((item) => (
                                    <li key={item}>
                                        {Minus}
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- FAQ ---------- */}
            <section className="band band--alt" id="faq">
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
                                    {Chevron}
                                </summary>
                                <p className="faq-item__body">{a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- CTA ---------- */}
            <section className="landing-cta">
                <div className="wrap">
                    <div className="landing-cta__inner" data-reveal>
                        <h2 className="landing-cta__title">Save one search and see what turns up.</h2>
                        <p className="landing-cta__lede">
                            The free plan is one search, run weekly, for as long as you want it. If
                            nothing useful arrives, you have lost nothing.
                        </p>
                        <div className="hero-ctas">
                            <Link href="/sign-up" className="cta-btn cta-btn--primary">
                                Start free
                            </Link>
                            <Link href="/actors" className="cta-btn cta-btn--ghost">
                                Or the pay-per-use catalog
                            </Link>
                        </div>
                        <p className="landing-cta__note">
                            No card · {price('KES', 'monthly')} or {price('USD', 'monthly')} a month when you want more
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
