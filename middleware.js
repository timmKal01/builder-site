import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk is for customers. The admin area keeps its own cookie session
// (lib/session.js) and is deliberately absent from the matcher below — two
// auth systems that never meet is simpler to reason about, and it means a
// Clerk outage cannot lock the owner out of their own admin.
//
// The matcher is an allowlist rather than the usual "everything except static
// files" pattern, so the marketing pages stay free of Clerk's client bundle.
//
// This only makes the session available. The actual "are you allowed in"
// check lives in each page and server action, which is what Clerk now
// recommends: middleware matching is path-based and can diverge from how
// Next.js really routes a request. It did exactly that here — auth.protect()
// in middleware answered 404 instead of redirecting, because it had no
// sign-in URL to send anyone to, and the page looked like it did not exist.
export default clerkMiddleware();

export const config = {
    matcher: ['/dashboard(.*)', '/sign-in(.*)', '/sign-up(.*)', '/api/signals(.*)'],
};
