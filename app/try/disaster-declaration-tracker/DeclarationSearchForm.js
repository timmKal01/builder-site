'use client';

import { useState } from 'react';

const INCIDENT_TYPES = [
    ['', 'All incident types'],
    ['Fire', 'Fire'],
    ['Flood', 'Flood'],
    ['Hurricane', 'Hurricane'],
    ['Severe Storm(s)', 'Severe Storm(s)'],
    ['Tornado', 'Tornado'],
    ['Snowstorm', 'Snowstorm'],
    ['Severe Ice Storm', 'Severe Ice Storm'],
];

function formatDate(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : '—';
}

const ACTOR_URL = 'https://apify.com/m_ctim/disaster-declaration-tracker';

export default function DeclarationSearchForm() {
    const [form, setForm] = useState({ state: '', incidentType: '' });
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
            const res = await fetch('/api/demo/disaster-declaration-tracker', {
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
                        <label htmlFor="state">State</label>
                        <input
                            id="state"
                            type="text"
                            value={form.state}
                            onChange={updateField('state')}
                            placeholder="e.g. TX"
                            maxLength={2}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="incidentType">Incident type</label>
                        <select id="incidentType" value={form.incidentType} onChange={updateField('incidentType')}>
                            {INCIDENT_TYPES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search declarations'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 90 days, 10 results, most recent first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run disaster-declaration-tracker on Apify with your own account for
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
                <p className="demo-empty">No declarations matched that search in the last 90 days. Try a different state or clear the incident type.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>State</th>
                                    <th>Type</th>
                                    <th>Declared</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((d) => (
                                    <tr key={d.femaDeclarationString}>
                                        <td>
                                            <a href={d.url} target="_blank" rel="noreferrer">
                                                {d.declarationTitle}
                                            </a>
                                        </td>
                                        <td>{d.state}</td>
                                        <td>{d.incidentType}</td>
                                        <td className="mono">{formatDate(d.declarationDate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own states and incident types,
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
