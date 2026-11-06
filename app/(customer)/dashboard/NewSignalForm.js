'use client';

import { useActionState, useState } from 'react';
import { createSignalAction } from './actions.js';

const initialState = { error: null, ok: null };

// One saved web design lead search: what kind of business, where, and which leads count.
export default function NewSignalForm({ businessTypes, schedules, maxCities, atLimit, planLabel, limit }) {
    const [state, formAction, pending] = useActionState(createSignalAction, initialState);
    const [leadType, setLeadType] = useState('no_website');

    if (atLimit) {
        return (
            <div className="demo-cta">
                <p className="demo-cta__title">Search limit reached</p>
                <p className="demo-cta__body">
                    The {planLabel} plan covers {limit} search{limit === 1 ? '' : 'es'}. Pause one, or
                    upgrade to run more.
                </p>
            </div>
        );
    }

    return (
        <form action={formAction} className="demo-form">
            {state?.error && <p className="form-error">{state.error}</p>}
            {state?.ok && <p className="demo-note">{state.ok}</p>}

            <div className="form-field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" maxLength={80} placeholder="Denver plumbers, no website" required />
            </div>

            <div className="form-field">
                <label htmlFor="businessType">Type of business</label>
                <select id="businessType" name="businessType" defaultValue="plumber">
                    {businessTypes.map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-field">
                <label htmlFor="term">Or type any business</label>
                <input id="term" name="term" type="text" maxLength={80} placeholder="yoga studio, pet groomer, wedding photographer" />
                <span className="demo-note">Used instead of the list when filled in.</span>
            </div>

            <div className="form-field">
                <label htmlFor="cities">
                    {maxCities === 1 ? 'City or area' : `Cities or areas (up to ${maxCities}, one per line)`}
                </label>
                <textarea id="cities" name="cities" rows={maxCities === 1 ? 1 : 4} placeholder={'Denver, USA\nAurora, USA'} required />
                <span className="demo-note">Add the country when the name is common, e.g. &ldquo;Manchester, UK&rdquo;.</span>
            </div>

            <div className="form-field">
                <label htmlFor="leadType">Which leads</label>
                <select id="leadType" name="leadType" value={leadType} onChange={(e) => setLeadType(e.target.value)}>
                    <option value="no_website">No website at all (or only a Facebook or Instagram page)</option>
                    <option value="any_gap">Any website gap: missing, broken, dated, not mobile-friendly</option>
                </select>
            </div>

            {leadType === 'any_gap' && (
                <div className="form-field">
                    <label htmlFor="minScore">Minimum lead score (0 to 100)</label>
                    <input id="minScore" name="minScore" type="number" min={0} max={100} defaultValue={50} />
                    <span className="demo-note">Higher means the website needs more work. 50 skips sites in decent shape.</span>
                </div>
            )}

            <div className="form-field">
                <label htmlFor="schedule">How often</label>
                <select id="schedule" name="schedule" defaultValue={schedules[0]} required>
                    {schedules.map((s) => (
                        <option key={s} value={s}>
                            {s === 'daily' ? 'Daily' : 'Weekly'}
                        </option>
                    ))}
                </select>
                <span className="demo-note">Each run brings only businesses you haven&rsquo;t been sent before.</span>
            </div>

            <div className="demo-cta__actions">
                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Saving…' : 'Save search'}
                </button>
            </div>
        </form>
    );
}
