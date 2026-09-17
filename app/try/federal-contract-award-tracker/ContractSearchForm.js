'use client';

import { useState } from 'react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const ACTOR_URL = 'https://apify.com/m_ctim/federal-contract-award-tracker';

export default function ContractSearchForm() {
    const [form, setForm] = useState({ keyword: 'cybersecurity', agency: '', recipientState: '' });
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [capped, setCapped] = useState(false);
    const [pending, setPending] = useState(false);

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
            const res = await fetch('/api/demo/federal-contract-award-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
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
                            placeholder="e.g. cybersecurity"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="agency">Awarding agency</label>
                        <input
                            id="agency"
                            type="text"
                            value={form.agency}
                            onChange={updateField('agency')}
                            placeholder="e.g. Department of Defense"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="recipientState">Recipient state</label>
                        <input
                            id="recipientState"
                            type="text"
                            value={form.recipientState}
                            onChange={updateField('recipientState')}
                            placeholder="e.g. VA"
                            maxLength={2}
                        />
                    </div>
                </div>

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search awards'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 30 days, 10 results, largest awards first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run federal-contract-award-tracker on Apify with your own account for
                        unlimited searches, saved schedules, and full result sets.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {results && results.length === 0 && (
                <p className="demo-empty">No awards matched that search in the last 30 days. Try a broader keyword or clear a filter.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Recipient</th>
                                    <th>Amount</th>
                                    <th>Agency</th>
                                    <th>NAICS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((award) => (
                                    <tr key={award.awardId}>
                                        <td>
                                            <a href={award.usaspendingUrl} target="_blank" rel="noreferrer">
                                                {award.recipientName}
                                            </a>
                                        </td>
                                        <td className="mono">{currencyFormatter.format(award.awardAmount)}</td>
                                        <td>{award.awardingAgency}</td>
                                        <td className="mono">{award.naicsCode || '—'}</td>
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
