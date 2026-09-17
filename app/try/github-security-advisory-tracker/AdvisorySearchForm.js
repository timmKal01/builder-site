'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const ECOSYSTEMS = [
    ['all', 'All ecosystems'],
    ['npm', 'npm (JavaScript)'],
    ['pip', 'pip (Python)'],
    ['maven', 'Maven (Java)'],
    ['nuget', 'NuGet (.NET)'],
    ['composer', 'Composer (PHP)'],
    ['rubygems', 'RubyGems (Ruby)'],
    ['go', 'Go'],
    ['rust', 'Rust (crates.io)'],
];

const SEVERITIES = [
    ['all', 'All severities'],
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/github-security-advisory-tracker';

function formatDate(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : '—';
}

export default function AdvisorySearchForm() {
    const [form, setForm] = useState({ ecosystem: 'npm', packageName: '', severity: 'all' });
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
            const res = await fetch('/api/demo/github-security-advisory-tracker', {
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
                        <label htmlFor="ecosystem">Ecosystem</label>
                        <select id="ecosystem" value={form.ecosystem} onChange={updateField('ecosystem')}>
                            {ECOSYSTEMS.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="packageName">Package</label>
                        <input
                            id="packageName"
                            type="text"
                            value={form.packageName}
                            onChange={updateField('packageName')}
                            placeholder="e.g. lodash"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="severity">Severity</label>
                        <select id="severity" value={form.severity} onChange={updateField('severity')}>
                            {SEVERITIES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search advisories'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Last 30 days, 10 results, most recent first.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run github-security-advisory-tracker on Apify with your own account for
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
                <p className="demo-empty">No advisories matched that search in the last 30 days. Try a broader package or ecosystem.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Advisory</th>
                                    <th>Severity</th>
                                    <th>CVE</th>
                                    <th>Packages</th>
                                    <th>Published</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((a) => (
                                    <tr key={a.ghsaId}>
                                        <td>
                                            <a href={a.htmlUrl} target="_blank" rel="noreferrer">
                                                {a.summary}
                                            </a>
                                        </td>
                                        <td>{a.severity || '—'}</td>
                                        <td className="mono">{a.cveId || '—'}</td>
                                        <td>{(a.affectedPackages || []).map((p) => p.name).filter(Boolean).slice(0, 2).join(', ') || '—'}</td>
                                        <td className="mono">{formatDate(a.publishedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own ecosystems and packages,
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
