'use client';

import { useState } from 'react';

const EVENT_TYPES = [
    ['all', 'All event types'],
    ['Malfunction', 'Malfunction'],
    ['Injury', 'Injury'],
    ['Death', 'Death'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/medical-device-adverse-event-tracker';

export default function DeviceEventSearchForm() {
    const [form, setForm] = useState({ deviceName: 'insulin pump', eventType: 'all' });
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
            const res = await fetch('/api/demo/medical-device-adverse-event-tracker', {
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
                        <label htmlFor="deviceName">Device name</label>
                        <input
                            id="deviceName"
                            type="text"
                            value={form.deviceName}
                            onChange={updateField('deviceName')}
                            placeholder="e.g. insulin pump"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="eventType">Event type</label>
                        <select id="eventType" value={form.eventType} onChange={updateField('eventType')}>
                            {EVENT_TYPES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search reports'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 30 days, 10 results, most recent first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run medical-device-adverse-event-tracker on Apify with your own account for
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
                <p className="demo-empty">No reports matched that search in the last 30 days. Try a broader device name or clear the event type filter.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>Manufacturer</th>
                                    <th>Event</th>
                                    <th>Received</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((report) => (
                                    <tr key={report.reportNumber}>
                                        <td>{report.deviceGenericName || '—'}</td>
                                        <td>{report.manufacturer || '—'}</td>
                                        <td>{report.eventType}</td>
                                        <td className="mono">{report.dateReceived}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own device names and event
                            types, directly on Apify.
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
