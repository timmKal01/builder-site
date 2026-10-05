'use client';

import { useActionState, useState } from 'react';
import { createSignalAction } from './actions.js';

const initialState = { error: null, ok: null };

export default function NewSignalForm({ sources, schedules, atLimit, planLabel, limit }) {
    const [state, formAction, pending] = useActionState(createSignalAction, initialState);
    const [source, setSource] = useState(sources[0]?.key ?? '');
    const chosen = sources.find((s) => s.key === source);

    if (atLimit) {
        return (
            <div className="demo-cta">
                <p className="demo-cta__title">Signal limit reached</p>
                <p className="demo-cta__body">
                    The {planLabel} plan covers {limit} signal{limit === 1 ? '' : 's'}. Pause one, or
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
                <input id="name" name="name" type="text" maxLength={80} placeholder="Nairobi salons, no website" required />
            </div>

            <div className="form-field">
                <label htmlFor="source">What to watch</label>
                <select id="source" name="source" value={source} onChange={(e) => setSource(e.target.value)} required>
                    {sources.map((s) => (
                        <option key={s.key} value={s.key}>
                            {s.label}
                        </option>
                    ))}
                </select>
                {chosen && <span className="demo-note">{chosen.blurb}</span>}
            </div>

            <div className="form-field">
                <label htmlFor="query">Search for</label>
                <input id="query" name="query" type="text" placeholder="hair salon in Nairobi" required />
            </div>

            <div className="form-field">
                <label htmlFor="schedule">How often</label>
                <select id="schedule" name="schedule" defaultValue={schedules[0]} required>
                    {schedules.map((s) => (
                        <option key={s} value={s}>
                            {s === 'daily' ? 'Daily' : 'Weekly'}
                        </option>
                    ))}
                </select>
                <span className="demo-note">
                    You only ever receive matches you have not been sent before.
                </span>
            </div>

            <div className="demo-cta__actions">
                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Creating…' : 'Create signal'}
                </button>
            </div>
        </form>
    );
}
