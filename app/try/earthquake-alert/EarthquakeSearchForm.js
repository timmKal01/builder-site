'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const MAGNITUDES = [
    ['3', '3.0+ (minor)'],
    ['4.5', '4.5+ (light)'],
    ['5.5', '5.5+ (moderate)'],
    ['6.5', '6.5+ (strong)'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/earthquake-alert';

function formatDateTime(value) {
    return value ? new Date(value).toLocaleString() : '—';
}

export default function EarthquakeSearchForm() {
    const [minMagnitude, setMinMagnitude] = useState('4.5');
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
            const res = await fetch('/api/demo/earthquake-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minMagnitude, email }),
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
                    <label htmlFor="minMagnitude">Minimum magnitude</label>
                    <select id="minMagnitude" value={minMagnitude} onChange={(e) => setMinMagnitude(e.target.value)}>
                        {MAGNITUDES.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search earthquakes'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 7 days, 10 results, most recent first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run earthquake-alert on Apify with your own account for unlimited searches,
                        saved schedules, and full result sets.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {results && results.length === 0 && (
                <p className="demo-empty">No earthquakes at or above that magnitude in the last 7 days. Try a lower threshold.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Place</th>
                                    <th>Magnitude</th>
                                    <th>Depth (km)</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((eq) => (
                                    <tr key={eq.eventId}>
                                        <td>
                                            <a href={eq.url} target="_blank" rel="noreferrer">
                                                {eq.place}
                                            </a>
                                        </td>
                                        <td className="mono">{eq.magnitude}</td>
                                        <td className="mono">{eq.depthKm ?? '—'}</td>
                                        <td className="mono">{formatDateTime(eq.time)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own region and magnitude
                            threshold, directly on Apify.
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
