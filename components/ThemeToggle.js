'use client';

import { useEffect, useState } from 'react';

const SUN = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
        <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
    </svg>
);

const MOON = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
);

// `theme` starts null so the server render and the pre-hydration client
// render agree (the real value lives in a DOM attribute set by the inline
// script in layout.js, not in React state) — avoids a hydration mismatch.
export default function ThemeToggle() {
    const [theme, setTheme] = useState(null);

    useEffect(() => {
        setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    }, []);

    function toggle() {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try {
            localStorage.setItem('theme', next);
        } catch {
            // Storage can be unavailable (private browsing, blocked); the
            // toggle still works for the rest of the session either way.
        }
        setTheme(next);
    }

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
            {isDark ? SUN : MOON}
        </button>
    );
}
