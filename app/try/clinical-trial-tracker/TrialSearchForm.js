'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const PHASES = [
    ['all', 'All phases'],
    ['EARLY_PHASE1', 'Early Phase 1'],
    ['PHASE1', 'Phase 1'],
    ['PHASE2', 'Phase 2'],
    ['PHASE3', 'Phase 3'],
    ['PHASE4', 'Phase 4'],
];

const STATUSES = [
    ['new', 'New (recruiting / not yet recruiting)'],
    ['all', 'All statuses'],
    ['completed', 'Completed'],
    ['terminated', 'Terminated / withdrawn / suspended'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/clinical-trial-tracker';

function formatDate(value) {
    return value || '—';
}

export default function TrialSearchForm() {
    const [form, setForm] = useState({ condition: 'oncology', sponsor: '', phase: 'all', status: 'new', country: '' });
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
            const res = await fetch('/api/demo/clinical-trial-tracker', {
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
                        <label htmlFor="condition">Condition</label>
                        <input
                            id="condition"
                            type="text"
                            value={form.condition}
                            onChange={updateField('condition')}
                            placeholder="e.g. oncology"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="sponsor">Sponsor</label>
                        <input
                            id="sponsor"
                            type="text"
                            value={form.sponsor}
                            onChange={updateField('sponsor')}
                            placeholder="e.g. Pfizer"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="phase">Phase</label>
                        <select id="phase" value={form.phase} onChange={updateField('phase')}>
                            {PHASES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="status">Status</label>
                        <select id="status" value={form.status} onChange={updateField('status')}>
                            {STATUSES.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="country">Country</label>
                        <input
                            id="country"
                            type="text"
                            value={form.country}
                            onChange={updateField('country')}
                            placeholder="e.g. Germany"
                        />
                    </div>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Searching…' : 'Search trials'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Shows the most recent postings from the last 14 days, up to 10 results.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run clinical-trial-tracker on Apify with your own account for unlimited
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
                <p className="demo-empty">No trials matched that search in the last 14 days. Try a broader condition or clear the sponsor field.</p>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Trial</th>
                                    <th>Sponsor</th>
                                    <th>Phase</th>
                                    <th>Status</th>
                                    <th>Posted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((trial) => (
                                    <tr key={trial.nctId}>
                                        <td>
                                            <a href={trial.studyUrl} target="_blank" rel="noreferrer">
                                                {trial.briefTitle}
                                            </a>
                                        </td>
                                        <td>{trial.leadSponsor}</td>
                                        <td>{(trial.phases || []).join(', ') || '—'}</td>
                                        <td>{trial.overallStatus}</td>
                                        <td className="mono">{formatDate(trial.studyFirstPostDate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own conditions and sponsors,
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
