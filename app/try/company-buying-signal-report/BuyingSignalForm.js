'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const ACTOR_URL = 'https://apify.com/m_ctim/company-buying-signal-report';

export default function BuyingSignalForm() {
    const [form, setForm] = useState({ domain: 'stripe.com', greenhouseSlug: 'stripe', leverSlug: '' });
    const [report, setReport] = useState(null);
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
        setReport(null);

        try {
            const res = await fetch('/api/demo/company-buying-signal-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setCapped(res.status === 429);
            } else {
                setReport(data.results?.[0] ?? null);
            }
        } catch {
            setError('Could not reach the demo. Try again in a moment.');
        } finally {
            setPending(false);
        }
    }

    const hasContact =
        report && ((report.contact?.emails?.length ?? 0) > 0 || (report.contact?.phones?.length ?? 0) > 0);

    return (
        <div className="demo-panel">
            <form onSubmit={handleSubmit} className="demo-form">
                <div className="demo-form-grid">
                    <div className="form-field">
                        <label htmlFor="domain">Company domain</label>
                        <input
                            id="domain"
                            type="text"
                            value={form.domain}
                            onChange={updateField('domain')}
                            placeholder="e.g. stripe.com"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="greenhouseSlug">Greenhouse slug (optional)</label>
                        <input
                            id="greenhouseSlug"
                            type="text"
                            value={form.greenhouseSlug}
                            onChange={updateField('greenhouseSlug')}
                            placeholder="e.g. stripe"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="leverSlug">Lever slug (optional)</label>
                        <input
                            id="leverSlug"
                            type="text"
                            value={form.leverSlug}
                            onChange={updateField('leverSlug')}
                            placeholder="e.g. palantir"
                        />
                    </div>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Analyzing…' : 'Build report'}
                </button>
                <p className="demo-note">Shared demo, capped per day. One company at a time.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run company-buying-signal-report on Apify with your own account for a whole
                        prospect list and a saved schedule.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {report && (
                <>
                    <div className="briefing-card">
                        <div className="briefing-card__head">
                            <h2>{report.domain}</h2>
                            <span className="mono">signal: {report.signalStrength} ({report.signalScore})</span>
                        </div>

                        <div className="briefing-grid">
                            <div className="briefing-block">
                                <span className="briefing-block__title">Hiring</span>
                                <p className="briefing-block__lede">{report.hiring?.openRolesCount ?? 0} open roles</p>
                                {report.hiring?.notableRoles?.length > 0 ? (
                                    <p className="briefing-block__note">Notable: {report.hiring.notableRoles.slice(0, 3).join(', ')}</p>
                                ) : (
                                    <p className="briefing-block__note">No roles matched the notable-keyword list.</p>
                                )}
                            </div>

                            <div className="briefing-block">
                                <span className="briefing-block__title">Tech stack</span>
                                {report.techStack && Object.values(report.techStack).flat().length > 0 ? (
                                    <p className="briefing-block__lede">{Object.values(report.techStack).flat().join(', ')}</p>
                                ) : (
                                    <p className="briefing-block__note">Nothing detected.</p>
                                )}
                            </div>

                            <div className="briefing-block">
                                <span className="briefing-block__title">Contact</span>
                                {hasContact ? (
                                    <>
                                        <p className="briefing-block__note">{(report.contact.emails || []).length} email(s) found</p>
                                        <p className="briefing-block__note">{(report.contact.phones || []).length} phone(s) found</p>
                                    </>
                                ) : (
                                    <p className="briefing-block__note">No public contact info found.</p>
                                )}
                            </div>

                            <div className="briefing-block">
                                <span className="briefing-block__title">Why this score</span>
                                {(report.signalReasons || []).map((reason, i) => (
                                    <p className="briefing-block__note" key={i}>{reason}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, across a whole prospect list, directly on
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
