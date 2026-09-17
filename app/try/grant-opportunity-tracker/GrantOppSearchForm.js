'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const ACTOR_URL = 'https://apify.com/m_ctim/grant-opportunity-tracker';

function formatDate(value) {
    return value || '—';
}

export default function GrantOppSearchForm() {
    const [form, setForm] = useState({ keyword: 'climate resilience', agencyCode: '' });
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [capped, setCapped] = useState(false);
    const [pending, setPending] = useState(false);
    const [email, setEmail] = useDemoEmail();

    function updateField(field) {
        return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError(null);
        setCapped(false);
        setResults(null);

        try {
            const res = await fetch('/api/demo/grant-opportunity-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, email }),
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
                <div className="demo-form-grid">
                    <div className="form-field">
                        <label htmlFor="keyword">Keyword</label>
                        <input
                            id="keyword"
                            type="text"
                            value={form.keyword}
                            onChange={updateField('keyword')}
                            placeholder="e.g. climate resilience"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="agencyCode">Agency code</label>
                        <input
                            id="agencyCode"
                            type="text"
                            value={form.agencyCode}
                            onChange={updateField('agencyCode')}
                            placeholder="e.g. NSF"
                        />
                    </div>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search opportunities'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 14 days, 10 results, most recent first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run grant-opportunity-tracker on Apify with your own account for unlimited
                        searches, saved schedules, and full result sets.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {results && results.length === 0 && (
                <p className="demo-empty">No opportunities matched that search in the last 14 days. Try a broader keyword or clear the agency code.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Agency</th>
                                    <th>Open</th>
                                    <th>Close</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((opp) => (
                                    <tr key={opp.opportunityId}>
                                        <td>
                                            <a href={opp.opportunityUrl} target="_blank" rel="noreferrer">
                                                {opp.title}
                                            </a>
                                        </td>
                                        <td>{opp.agency}</td>
                                        <td className="mono">{formatDate(opp.openDate)}</td>
                                        <td className="mono">{formatDate(opp.closeDate)}</td>
                                        <td>{opp.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own keywords and agencies,
                            directly on Apify.
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
