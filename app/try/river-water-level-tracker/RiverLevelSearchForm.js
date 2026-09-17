'use client';

import { useState } from 'react';

const STATES = [
    ['LA', 'Louisiana (Lower Mississippi)'],
    ['KY', 'Kentucky (Ohio / Mississippi)'],
    ['IL', 'Illinois (Illinois / Mississippi)'],
    ['MO', 'Missouri (Mississippi)'],
    ['TN', 'Tennessee (Tennessee River)'],
    ['OH', 'Ohio (Ohio River)'],
    ['CO', 'Colorado'],
];

const PARAMETERS = [
    ['gaugeHeight', 'Gauge height (feet)'],
    ['streamflow', 'Streamflow (cubic feet/sec)'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/river-water-level-tracker';

function formatDateTime(value) {
    return value ? new Date(value).toLocaleString() : '—';
}

export default function RiverLevelSearchForm() {
    const [form, setForm] = useState({ stateCode: 'LA', parameter: 'gaugeHeight' });
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
            const res = await fetch('/api/demo/river-water-level-tracker', {
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
                        <label htmlFor="stateCode">State</label>
                        <select id="stateCode" value={form.stateCode} onChange={updateField('stateCode')}>
                            {STATES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="parameter">Reading</label>
                        <select id="parameter" value={form.parameter} onChange={updateField('parameter')}>
                            {PARAMETERS.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Check gauges'}
                </button>
                <p className="demo-note">Shared demo, capped per day. 10 sites, highest reading first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run river-water-level-tracker on Apify with your own account for unlimited
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
                <p className="demo-empty">No active sites returned for that state. Try a different one.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Site</th>
                                    <th>Reading</th>
                                    <th>Unit</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((site) => (
                                    <tr key={site.siteNumber}>
                                        <td>{site.siteName}</td>
                                        <td className="mono">{site.value}</td>
                                        <td>{site.unit}</td>
                                        <td className="mono">{formatDateTime(site.dateTime)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own states and sites, directly on
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
