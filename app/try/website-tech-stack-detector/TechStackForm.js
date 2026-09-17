'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const ACTOR_URL = 'https://apify.com/m_ctim/website-tech-stack-detector';

const CATEGORIES = [
    ['cms', 'CMS'],
    ['ecommerce', 'Ecommerce'],
    ['jsFrameworks', 'JS framework'],
    ['analytics', 'Analytics'],
    ['cdnHosting', 'CDN / hosting'],
    ['payment', 'Payment'],
    ['liveChat', 'Live chat'],
];

export default function TechStackForm() {
    const [url, setUrl] = useState('https://apify.com');
    const [site, setSite] = useState(null);
    const [error, setError] = useState(null);
    const [capped, setCapped] = useState(false);
    const [pending, setPending] = useState(false);
    const [email, setEmail] = useDemoEmail();

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError(null);
        setCapped(false);
        setSite(null);

        try {
            const res = await fetch('/api/demo/website-tech-stack-detector', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setCapped(res.status === 429);
            } else {
                setSite(data.results?.[0] ?? null);
            }
        } catch {
            setError('Could not reach the demo. Try again in a moment.');
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="demo-panel">
            <form onSubmit={handleSubmit} className="demo-form">
                <div className="form-field">
                    <label htmlFor="url">Website URL</label>
                    <input
                        id="url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g. https://example.com"
                        required
                    />
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Analyzing…' : 'Detect stack'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Checks the homepage only.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run website-tech-stack-detector on Apify with your own account for
                        unlimited sites and a saved schedule.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {site && (
                <>
                    <div className="briefing-card">
                        <div className="briefing-card__head">
                            <h2>{site.url}</h2>
                            <span className="mono">as of {new Date(site.analyzedAt).toLocaleString()}</span>
                        </div>

                        <div className="briefing-grid">
                            {CATEGORIES.map(([key, label]) => (
                                <div className="briefing-block" key={key}>
                                    <span className="briefing-block__title">{label}</span>
                                    {(site[key] || []).length > 0 ? (
                                        <p className="briefing-block__lede">{site[key].join(', ')}</p>
                                    ) : (
                                        <p className="briefing-block__note">None detected.</p>
                                    )}
                                </div>
                            ))}

                            <div className="briefing-block">
                                <span className="briefing-block__title">Server / other</span>
                                <p className="briefing-block__note">Server: {site.server || 'unknown'}</p>
                                <p className="briefing-block__note">Powered by: {site.poweredBy || 'unknown'}</p>
                                <p className="briefing-block__note">Generator: {site.generator || 'unknown'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, across a whole list of sites, directly on
                            Apify.
                        </p>
                        <div className="demo-cta__actions">
                            <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                                Run it on Apify
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
