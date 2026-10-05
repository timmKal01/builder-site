'use client';

import { useActionState, useState } from 'react';
import { markPaidAction } from './actions.js';

const initialState = { error: null, ok: null };

// Currency defaults to whatever the account signed up with, since that is
// almost always what they paid in, but stays editable: a Nairobi agency with
// an international client sometimes settles in dollars.
export default function MarkPaidForm({ accounts, prices }) {
    const [state, formAction, pending] = useActionState(markPaidAction, initialState);
    const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
    const [interval, setInterval] = useState('monthly');

    const account = accounts.find((a) => String(a.id) === String(accountId));
    const currency = account?.currency ?? 'USD';
    const amount = prices?.[currency]?.[interval] ?? null;

    return (
        <form action={formAction} className="demo-form">
            {state?.error && <p className="form-error">{state.error}</p>}
            {state?.ok && <p className="demo-note">{state.ok}</p>}

            <div className="demo-form-grid">
                <div className="form-field">
                    <label htmlFor="accountId">Account</label>
                    <select
                        id="accountId"
                        name="accountId"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        required
                    >
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.email} ({a.plan})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="plan">Plan</label>
                    <select id="plan" name="plan" defaultValue="pro" required>
                        <option value="pro">Pro</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="interval">Interval</label>
                    <select
                        id="interval"
                        name="interval"
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        required
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="currency">Currency</label>
                    <select id="currency" name="currency" defaultValue={currency} key={currency} required>
                        <option value="USD">USD</option>
                        <option value="KES">KES</option>
                    </select>
                </div>
            </div>

            <div className="form-field">
                <label htmlFor="reference">Reference</label>
                <input
                    id="reference"
                    name="reference"
                    type="text"
                    placeholder="M-Pesa code or transfer reference"
                />
                <span className="demo-note">
                    Recorded against the payment, and the same reference cannot be credited twice.
                </span>
            </div>

            <div className="demo-cta__actions">
                <button className="btn" type="submit" disabled={pending || accounts.length === 0}>
                    {pending ? 'Recording…' : `Mark paid${amount ? ` · ${amount}` : ''}`}
                </button>
            </div>
        </form>
    );
}
