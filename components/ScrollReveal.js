'use client';

import { useEffect } from 'react';

// One observer for the whole page. Elements are only hidden via the `.js`
// class (see the inline script in layout.js), so content stays visible by
// default if JS fails to load or run — this only adds motion, never gates
// visibility on it.
export default function ScrollReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('[data-reveal]:not(.is-visible)');
        if (!els.length) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return null;
}
