export default function ActorCard({ actor, revealIndex }) {
    return (
        <article
            className="actor-card"
            data-reveal
            style={revealIndex != null ? { '--i': revealIndex } : undefined}
        >
            <span className="actor-card__method">GET /{actor.slug.split('/')[1]}</span>
            <h3 className="actor-card__title">{actor.title}</h3>
            <p className="actor-card__desc">{actor.description}</p>
            {actor.demoPath && (
                <a href={actor.demoPath} className="actor-card__demo">
                    Try it live {'→'}
                </a>
            )}

            <div className="actor-card__footer">
                <span className="actor-card__price">
                    {actor.priceUsd != null ? `$${actor.priceUsd.toFixed(3)}/event` : 'free during launch'}
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
    );
}
