import { getActorCatalog } from '@/lib/actors.js';

export const metadata = { title: 'Actors — Build Log' };

export default async function ActorsPage() {
    const actors = await getActorCatalog();

    return (
        <div className="wrap">
            <div className="catalog-intro">
                <p className="hero__eyebrow">the portfolio</p>
                <h1 className="hero__title">Data tools, callable on demand.</h1>
                <p className="hero__lede">
                    Each one runs on Apify and returns clean JSON. Pricing is per event, not
                    per subscription — you pay for runs, not for a seat.
                </p>
            </div>

            <div className="catalog-grid">
                {actors.map((actor) => (
                    <article className="actor-card" key={actor.slug}>
                        <span className="actor-card__method">GET /{actor.slug.split('/')[1]}</span>
                        <h2 className="actor-card__title">{actor.title}</h2>
                        <p className="actor-card__desc">{actor.description}</p>
                        <div className="actor-card__footer">
                            <span className="actor-card__price">
                                {actor.priceUsd != null ? `$${actor.priceUsd.toFixed(3)}/event` : 'free'}
                            </span>
                            <span className="actor-card__links">
                                <a href={actor.url} target="_blank" rel="noreferrer">
                                    Apify
                                </a>
                                <a href={actor.githubUrl} target="_blank" rel="noreferrer">
                                    Source
                                </a>
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
