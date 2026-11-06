import Link from 'next/link';
import { PLANS, PRICES, formatPrice } from '@/lib/signals/plans.js';
import { jsonLd, pageMeta } from '@/lib/site.js';

// Since 2026-11-06 this page sells one thing: web design leads from Website Gap Finder, every week.
export const metadata = pageMeta({
    title: 'Web Design Leads: Businesses With No or Bad Websites, Weekly',
    description:
        'New web design clients every week: local businesses with no website, or a broken or dated one, each with a score, the problems found and a pitch line. Free plan; Pro $19 or KES 1,500 a month.',
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
        title: 'Tell it who you build for',
        desc: 'A type of business from the list, or anything you type, like "yoga studio" or "pet groomer", and up to five cities you work in.',
    },
    {
        title: 'It checks Google Maps and every website',
        desc: 'Every listing in those cities, and each business\'s own site: does it load, is it secure, does it fit a phone screen, when was it last touched.',
    },
    {
        title: 'You only see what is new',
        desc: 'Every business it has already shown you is remembered, so each run brings fresh leads, never last week\'s list again.',
    },
    {
        title: 'You make the call',
        desc: 'Each lead has its phone, Google Maps link, the problems found and a one-line pitch. Work through them on your dashboard or download a CSV.',
    },
];

// A real row from Website Gap Finder (2026-10-22), with the salon's name, website and phone hidden.
const EXAMPLE = {
    name: 'Nail salon in Brooklyn, New York (name hidden)',
    score: 45,
    status: 'Website works, but dated',
    reasons: ['Copyright still says 2016', 'No meta description'],
    pitch: "(Salon)'s website still says © 2016 and is missing basic SEO tags; a refresh could bring in more customers.",
};

const YES = [
    'Businesses you have not been shown before',
    'The phone, Google Maps link and any public email the business lists',
    'A 0-100 score, the problems found and a pitch line',
    'A price in your own currency',
];

const NO = [
    'Emails written or sent for you',
    'Personal data, or anything behind a login',
    'A verified email address for every lead',
    'Leads nobody else could ever find',
];

const FAQ = [
    {
        q: 'Where do the leads come from?',
        a: 'Google Maps listings for the cities you pick, and each business\'s own public website. The checks are done by Website Gap Finder, the same tool anyone can run on the Apify Store; this saves you running, filtering and de-duplicating it every week.',
    },
    {
        q: 'What counts as a website gap?',
        a: 'No website at all, only a Facebook or Instagram page, a site that does not load, a shut-down site builder, or a site that works but is dated: no https, not built for phones, an old copyright year, missing a page title or description. Each problem adds to the 0-100 score.',
    },
    {
        q: 'How fresh are the leads?',
        a: 'Every run searches and checks the websites live, the morning it runs. Nothing comes from an old database.',
    },
    {
        q: 'Do you write or send the emails for me?',
        a: 'No. You get the leads, what is wrong with each website and a pitch line, and you reach out your own way: a call, a visit, an email or a DM.',
    },
    {
        q: 'How do I pay from Kenya?',
        a: 'In shillings, by M-Pesa or card. The Kenyan price is set for the Kenyan market rather than converted from the dollar price, because a straight conversion would be the wrong number locally. International customers pay in dollars by card.',
    },
    {
        q: 'What happens if I stop paying?',
        a: 'You drop back to the free plan rather than losing access. One weekly search in one city keeps running, and every lead you were already sent stays on your dashboard.',
    },
    {
        q: 'Can I try it without a card?',
        a: 'Yes. The free plan is one search in one city, run weekly, with up to 10 new leads a run. No card, and nothing expires.',
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
                        New web design clients,{' '}
                        <span className="text-grad">every week.</span>
                    </h1>
                    <p className="hero__lede rise" style={{ '--i': 2 }}>
                        Pick a type of business and the cities you work in. Every week it finds the ones on
                        Google Maps with no website, or a broken or dated one, checks each site, and shows you
                        only the businesses you have not seen before, each with a score and a pitch line.
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
                        <li>{Check} One city free, forever</li>
                        <li>{Check} Pay in KES or USD</li>
                        <li>{Check} Cancel whenever</li>
                    </ul>
                </div>
            </section>

            {/* ---------- The idea ---------- */}
            <section className="band band--alt">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">How it works</span>
                        <h2 className="section-title">A list goes stale. A feed does not.</h2>
                        <p className="section-lede">
                            Pull the same search twice and most of the second list is the first list. The
                            work is not finding businesses, it is knowing which ones need a website and which
                            you have not pitched yet. This does both.
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
                        <strong>Where it lands today:</strong> new leads collect on your dashboard,
                        ready to work through or download as a CSV. A Monday email is coming, so for now
                        you go and look rather than being told.
                    </p>
                </div>
            </section>

            {/* ---------- Example lead ---------- */}
            <section className="band" id="example">
                <div className="wrap">
                    <div className="section-head" data-reveal>
                        <span className="eyebrow">What a lead looks like</span>
                        <h2 className="section-title">Every lead says why it is a lead.</h2>
                        <p className="section-lede">
                            A real one, from a check of local businesses in five countries. The salon&rsquo;s
                            name, website and phone are hidden here; on your dashboard you see all of them.
                        </p>
                    </div>

                    <div className="features-grid">
                        <article className="feature-card" data-reveal>
                            <h3 className="feature-card__title">{EXAMPLE.name}</h3>
                            <p className="feature-card__desc">
                                <strong>Score {EXAMPLE.score}/100</strong> · {EXAMPLE.status}
                            </p>
                            <ul className="feature-card__desc">
                                {EXAMPLE.reasons.map((r) => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>
                            <p className="feature-card__desc">
                                <em>Pitch line:</em> {EXAMPLE.pitch}
                            </p>
                        </article>
                        <article className="feature-card" data-reveal style={{ '--i': 1 }}>
                            <h3 className="feature-card__title">And the ones with no website at all</h3>
                            <p className="feature-card__desc">
                                Choose &ldquo;no website only&rdquo; and every lead is a business with no site, or only a
                                Facebook or Instagram page: the easiest pitch there is. In one check of Denver plumbers,
                                19 of 160 on Google Maps had no website listed.
                            </p>
                        </article>
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
                            <p className="price-card__unit">one search in one city, weekly</p>
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
                                    <dd>{PLANS.pro.signals}, up to {PLANS.pro.cities} cities each</dd>
                                </div>
                                <div>
                                    <dt>New leads a month</dt>
                                    <dd>up to {PLANS.pro.maxNewPerMonth.toLocaleString('en-US')}</dd>
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
                                    <dd>{PLANS.pro.signals}, up to {PLANS.pro.cities} cities each</dd>
                                </div>
                                <div>
                                    <dt>New leads a month</dt>
                                    <dd>up to {PLANS.pro.maxNewPerMonth.toLocaleString('en-US')}</dd>
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
                                    Every lead is searched and checked live the week it arrives, not
                                    pulled from an old database. The worst websites come first.
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
                        <h2 className="landing-cta__title">Pick a city and see who needs a website.</h2>
                        <p className="landing-cta__lede">
                            The free plan is one search in one city, run weekly, for as long as you want it.
                            If nothing useful arrives, you have lost nothing.
                        </p>
                        <div className="hero-ctas">
                            <Link href="/sign-up" className="cta-btn cta-btn--primary">
                                Start free
                            </Link>
                            <a href="https://apify.com/m_ctim/website-gap-finder" className="cta-btn cta-btn--ghost">
                                Or run Website Gap Finder yourself
                            </a>
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
