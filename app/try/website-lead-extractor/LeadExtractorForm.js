'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const ACTOR_URL = 'https://apify.com/m_ctim/website-lead-extractor';

export default function LeadExtractorForm() {
    const [url, setUrl] = useState('https://apify.com');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [capped, setCapped] = useState(false);
    const [pending, setPending] = useState(false);
    const [email, setEmail] = useDemoEmail();

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError(null);
        setCapped(false);
        setResults(null);

        try {
            const res = await fetch('/api/demo/website-lead-extractor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setCapped(res.status === 429);
            } else {
                setResults(data.results);
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
                    {pending ? 'Scanning…' : 'Extract contacts'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Scans up to 5 pages, 1 hop deep.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run website-lead-extractor on Apify with your own account for unlimited
                        sites, deeper crawls, and a saved schedule.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {results && results.length === 0 && (
                <p className="demo-empty">No contact info found on the pages scanned. Try a different site.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>Emails</th>
                                    <th>Phones</th>
                                    <th>Social</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((page) => (
                                    <tr key={page.url}>
                                        <td>
                                            <a href={page.url} target="_blank" rel="noreferrer">
                                                {page.url}
                                            </a>
                                        </td>
                                        <td className="mono">{(page.emails || []).join(', ') || '—'}</td>
                                        <td className="mono">{(page.phones || []).join(', ') || '—'}</td>
                                        <td className="mono">{Object.keys(page.socialProfiles || {}).join(', ') || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with deeper crawls and more pages per
                            domain, directly on Apify.
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
