import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidSession, createSessionCookie, SESSION_COOKIE_NAME } from './auth.js';

export async function hasValidSession() {
    const store = await cookies();
    return isValidSession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireSession() {
    if (!(await hasValidSession())) {
        redirect('/admin/login');
    }
}

export async function setSessionCookie() {
    const store = await cookies();
    store.set(SESSION_COOKIE_NAME, createSessionCookie(), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });
}

export async function clearSessionCookie() {
    const store = await cookies();
    store.delete(SESSION_COOKIE_NAME);
}
