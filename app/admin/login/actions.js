'use server';

import { redirect } from 'next/navigation';
import { verifyPassword } from '@/lib/auth.js';
import { setSessionCookie } from '@/lib/session.js';

export async function loginAction(prevState, formData) {
    const password = formData.get('password');
    if (!verifyPassword(password)) {
        return { error: 'Wrong password.' };
    }
    await setSessionCookie();
    redirect('/admin');
}
