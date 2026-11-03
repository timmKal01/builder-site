import { getActorCatalog } from '@/lib/actors.js';
import ActorCard from '@/components/ActorCard.js';
import { pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({
    title: 'Public Data API Catalog: Leads, Jobs, SEC & Government Data',
    description:
        'Ready-to-run APIs: Google Maps business leads, website audits, job listings, SEC filings, NPI lookups and US government data. Pay per event, no logins.',
    path: '/actors',
});

export default async function ActorsPage() {
    const actors = await getActorCatalog();

    return (
        <div className="wrap page-shell">
            <div className="catalog-intro">
                <p className="hero__eyebrow">The portfolio</p>
                <h1 className="hero__title">Data tools, callable on demand.</h1>
                <p className="hero__lede">
                    Each one runs on Apify and returns clean JSON from public data. Most
                    cost $0.007 per event ($7 per 1,000), each card shows its price, and there is no subscription or seat.
                    No logins.
                </p>
            </div>

            <div className="catalog-grid">
                {actors.map((actor, i) => (
                    <ActorCard actor={actor} revealIndex={i % 8} key={actor.slug} />
                ))}
            </div>
        </div>
    );
}
