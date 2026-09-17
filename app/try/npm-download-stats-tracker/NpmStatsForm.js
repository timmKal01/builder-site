'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const ACTOR_URL = 'https://apify.com/m_ctim/npm-download-stats-tracker';

const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, signDisplay: 'always' });

export default function NpmStatsForm() {
    const [packages, setPackages] = useState('react, vue');
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
            const res = await fetch('/api/demo/npm-download-stats-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packages, email }),
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
                    <label htmlFor="packages">Packages (comma-separated, up to 3)</label>
                    <input
                        id="packages"
                        type="text"
                        value={packages}
                        onChange={(e) => setPackages(e.target.value)}
                        placeholder="e.g. react, vue"
                        required
                    />
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Checking…' : 'Check downloads'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 7 days vs. the 7 days before that.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run npm-download-stats-tracker on Apify with your own account for unlimited
                        packages, any period length, and a saved schedule.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Package</th>
                                    <th>This period</th>
                                    <th>Prior period</th>
                                    <th>Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((stat) => (
                                    <tr key={stat.package}>
                                        <td>{stat.package}</td>
                                        {stat.error ? (
                                            <td colSpan={3} className="mono">{stat.error}</td>
                                        ) : (
                                            <>
                                                <td className="mono">{numberFormatter.format(stat.currentPeriodDownloads)}</td>
                                                <td className="mono">{numberFormatter.format(stat.previousPeriodDownloads)}</td>
                                                <td className="mono">
                                                    {stat.percentChange != null ? `${percentFormatter.format(stat.percentChange)}%` : '—'}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with any package and period length,
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
