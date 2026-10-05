import { auth, currentUser } from '@clerk/nextjs/server';
import { isAllowedDemoOrigin, tryRecordDemoRun } from './db.js';

// One gate shared by all 21 demo routes, so the rule lives in a single place
// rather than being copy-pasted twenty-one times and drifting.
//
// The demo pages stay public and indexed — they are the best thing the site
// has for showing a buyer the data is real, and several blog posts point
// straight at them. Only the run itself needs an account. That keeps the
// pages in search results while making every run attributable, which the old
// email box never did: an address could be invented per run, and the IP cap
// meant four addresses were enough to exhaust a demo for everyone else.

export async function guardDemoRun(request, demoKey) {
    if (!isAllowedDemoOrigin(request)) {
        return { ok: false, response: Response.json({ error: 'Forbidden.' }, { status: 403 }) };
    }

    const { userId } = await auth();
    if (!userId) {
        return {
            ok: false,
            response: Response.json(
                {
                    error: 'Create a free account to run the live demos. It takes a moment and costs nothing.',
                    signInRequired: true,
                },
                { status: 401 }
            ),
        };
    }

    // Recorded alongside the run so the admin leads view still shows who tried
    // what — except now it is a verified address from Clerk rather than
    // whatever someone typed into a box.
    const user = await currentUser();
    const email =
        user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;

    const allowed = await tryRecordDemoRun(demoKey, userId, email);
    if (!allowed) {
        return {
            ok: false,
            response: Response.json(
                {
                    error: "You have used today's free runs for this demo. Run it on Apify for as much as you need, or come back tomorrow.",
                },
                { status: 429 }
            ),
        };
    }

    return { ok: true, userId, email };
}
