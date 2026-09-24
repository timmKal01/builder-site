import { getActorCatalog } from '@/lib/actors.js';
import ActorCard from '@/components/ActorCard.js';

export const metadata = { title: 'Actors' };

export default async function ActorsPage() {
    const actors = await getActorCatalog();

    return (
        <div className="wrap">
            <div className="catalog-intro">
                <p className="hero__eyebrow">the portfolio</p>
                <h1 className="hero__title">Data tools, callable on demand.</h1>
                <p className="hero__lede">
                    Each one runs on Apify and returns clean JSON from public data. Every
                    actor costs $0.007 per event ($7 per 1,000), with no subscription and no seat.
                    No proxies, no logins.
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
