'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const TYPES = [
    ['all', 'All'],
    ['acquired', 'Acquired (buys)'],
    ['disposed', 'Disposed (sells)'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/insider-trading-alert';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function InsiderSearchForm() {
    const [form, setForm] = useState({ ticker: 'AAPL', transactionType: 'all' });
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
            const res = await fetch('/api/demo/insider-trading-alert', {
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
                        <label htmlFor="ticker">Ticker (blank = market-wide)</label>
                        <input
                            id="ticker"
                            type="text"
                            value={form.ticker}
                            onChange={updateField('ticker')}
                            placeholder="e.g. AAPL"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="transactionType">Type</label>
                        <select id="transactionType" value={form.transactionType} onChange={updateField('transactionType')}>
                            {TYPES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search filings'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Scans up to 10 recent filings.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run insider-trading-alert on Apify with your own account for unlimited
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
                <p className="demo-empty">No matching transactions found in the filings scanned. Try a different ticker or type.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Issuer</th>
                                    <th>Insider</th>
                                    <th>Type</th>
                                    <th>Shares</th>
                                    <th>Value</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((t, i) => (
                                    <tr key={`${t.accessionNumber}-${i}`}>
                                        <td>
                                            <a href={t.filingUrl} target="_blank" rel="noreferrer">
                                                {t.issuerName}
                                            </a>
                                        </td>
                                        <td>{t.reportingOwnerName}</td>
                                        <td>{t.acquiredDisposedCode === 'A' ? 'Acquired' : 'Disposed'}</td>
                                        <td className="mono">{t.shares?.toLocaleString?.() ?? t.shares}</td>
                                        <td className="mono">{t.transactionValue != null ? currencyFormatter.format(t.transactionValue) : '—'}</td>
                                        <td className="mono">{t.transactionDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own tickers and thresholds,
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
