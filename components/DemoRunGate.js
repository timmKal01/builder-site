'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

// Sits where the email box used to. An email proved nothing — it could be
// invented per run — whereas an account makes every run attributable and
// gives the daily cap something real to count against.
//
// Renders nothing at all while Clerk is still loading, so the form never
// flashes "sign in" at somebody who is already signed in.
export default function DemoRunGate() {
    const { isLoaded, isSignedIn } = useAuth();
    const pathname = usePathname();

    if (!isLoaded || isSignedIn) return null;

    // Carries the demo they were looking at, so signing in returns them here
    // rather than dropping them on a dashboard with no idea why.
    const next = encodeURIComponent(pathname ?? '/');

    return (
        <div className="demo-gate">
            <p className="demo-gate__title">Free account needed to run this</p>
            <p className="demo-gate__body">
                The demo runs the real actor against the real source, which costs us a little each
                time. An account keeps that honest. It is free, takes a moment, and no card is asked
                for.
            </p>
            <div className="demo-cta__actions">
                <Link href={`/sign-up?redirect_url=${next}`} className="cta-btn cta-btn--primary cta-btn--sm">
                    Create a free account
                </Link>
                <Link href={`/sign-in?redirect_url=${next}`} className="cta-btn cta-btn--ghost cta-btn--sm">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
