'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'demo-lead-email';

// Shared across every /try/* demo so a visitor only has to type their email
// once per browser, not once per actor.
export function useDemoEmail() {
    const [email, setEmail] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setEmail(saved);
        } catch {
            // localStorage unavailable (private mode, blocked storage) — fine, just won't persist.
        }
    }, []);

    function updateEmail(value) {
        setEmail(value);
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // ignore
        }
    }

    return [email, updateEmail];
}
