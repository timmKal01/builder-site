'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const CATEGORIES = [
    ['all', 'All (drug + food + device)'],
    ['drug', 'Drug'],
    ['food', 'Food'],
    ['device', 'Device'],
];

const CLASSIFICATIONS = [
    ['all', 'All classes'],
    ['Class I', 'Class I (most severe)'],
    ['Class II', 'Class II'],
    ['Class III', 'Class III (least severe)'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/product-recall-alert';

export default function RecallSearchForm() {
    const [form, setForm] = useState({ category: 'all', keyword: '', classification: 'all' });
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
            const res = await fetch('/api/demo/product-recall-alert', {
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
                        <label htmlFor="category">Category</label>
                        <select id="category" value={form.category} onChange={updateField('category')}>
                            {CATEGORIES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="keyword">Keyword</label>
                        <input
                            id="keyword"
                            type="text"
                            value={form.keyword}
                            onChange={updateField('keyword')}
                            placeholder="e.g. salmonella"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="classification">Severity class</label>
                        <select id="classification" value={form.classification} onChange={updateField('classification')}>
                            {CLASSIFICATIONS.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search recalls'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 30 days, 10 results, most recent first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run product-recall-alert on Apify with your own account for unlimited
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
                <p className="demo-empty">No recalls matched that search in the last 30 days. Try a broader keyword or clear a filter.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Firm</th>
                                    <th>Class</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr key={r.recallNumber}>
                                        <td>{r.productDescription}</td>
                                        <td>{r.recallingFirm}</td>
                                        <td>{r.classification}</td>
                                        <td className="mono">{r.category}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own categories and keywords,
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
