// Curated slice of the portfolio, not the full ~76 — extend this array as
// more actors are worth featuring. Each entry needs only the Apify slug;
// everything else (description, pricing, category) is pulled live so this
// file never goes stale on its own.
export const FEATURED_ACTORS = [
    'm_ctim/website-lead-extractor',
    'm_ctim/company-buying-signal-report',
    'm_ctim/website-tech-stack-detector',
    'm_ctim/company-hiring-tracker',
    'm_ctim/insider-trading-alert',
    'm_ctim/certificate-transparency-monitor',
    'm_ctim/field-operations-risk-briefing',
    'm_ctim/clinical-trial-tracker',
    'm_ctim/federal-contract-award-tracker',
    'm_ctim/grant-opportunity-tracker',
    'm_ctim/github-security-advisory-tracker',
    'm_ctim/vulnerability-alert',
    'm_ctim/npm-download-stats-tracker',
    'm_ctim/earthquake-alert',
    'm_ctim/us-weather-tracker',
    'm_ctim/crypto-price-tracker',
];

// Actors with a live "try it now" page under /try/<slug> — most actors only
// have the Apify Console form, this is an extra low-friction demo layered on
// top for a non-technical buyer who wouldn't otherwise touch Apify directly.
const DEMO_PATHS = {
    'm_ctim/clinical-trial-tracker': '/try/clinical-trial-tracker',
    'm_ctim/field-operations-risk-briefing': '/try/field-operations-risk-briefing',
    'm_ctim/federal-contract-award-tracker': '/try/federal-contract-award-tracker',
};

function normalizeActor(raw) {
    const primaryEvent = Object.values(
        raw.pricingInfos?.at(-1)?.pricingPerEvent?.actorChargeEvents ?? {}
    )[0];
    const slug = `${raw.username}/${raw.name}`;

    return {
        slug,
        title: raw.title,
        description: raw.description,
        url: `https://apify.com/${raw.username}/${raw.name}`,
        githubUrl: `https://github.com/timmKal01/${raw.name}`,
        demoPath: DEMO_PATHS[slug] ?? null,
        categories: raw.categories ?? [],
        priceUsd: primaryEvent?.eventPriceUsd ?? null,
        totalUsers: raw.stats?.totalUsers ?? 0,
    };
}

export async function getActorCatalog() {
    const results = await Promise.all(
        FEATURED_ACTORS.map(async (slug) => {
            try {
                const res = await fetch(`https://api.apify.com/v2/acts/${slug.replace('/', '~')}`, {
                    next: { revalidate: 3600 },
                });
                if (!res.ok) return null;
                const { data } = await res.json();
                return normalizeActor(data);
            } catch {
                return null;
            }
        })
    );
    return results.filter(Boolean);
}
