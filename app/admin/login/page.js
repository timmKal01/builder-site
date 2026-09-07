'use client';

import { useActionState } from 'react';
import { loginAction } from './actions.js';

const initialState = { error: null };

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(loginAction, initialState);

    return (
        <div className="wrap">
            <div className="form-page">
                <h1 className="page-title">Admin login</h1>
                <form action={formAction}>
                    {state?.error && <p className="form-error">{state.error}</p>}
                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" required autoFocus />
                    </div>
                    <button className="btn" type="submit" disabled={pending}>
                        {pending ? 'Checking…' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
