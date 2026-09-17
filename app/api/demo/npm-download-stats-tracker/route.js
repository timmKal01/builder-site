import { tryRecordDemoRun, hashDemoIp, isAllowedDemoOrigin, isValidDemoEmail } from '@/lib/db.js';

const ACTOR_PATH = 'm_ctim~npm-download-stats-tracker';
const DEMO_KEY = 'npm-download-stats-tracker';

function cleanPackage(value) {
    return typeof value === 'string' ? value.trim().slice(0, 100) : '';
}

export async function POST(request) {
    if (!process.env.APIFY_TOKEN) {
        return Response.json({ error: 'Demo is not configured on this deployment.' }, { status: 500 });
    }

    if (!isAllowedDemoOrigin(request)) {
        return Response.json({ error: 'Forbidden.' }, { status: 403 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!isValidDemoEmail(body.email)) {
        return Response.json({ error: 'Enter a valid email to run the demo.' }, { status: 400 });
    }

    const packages = String(body.packages || '')
        .split(',')
        .map(cleanPackage)
        .filter(Boolean)
        .slice(0, 3);
    if (packages.length === 0) {
        return Response.json({ error: 'Enter at least one npm package name.' }, { status: 400 });
    }

    const input = { packages, daysBack: 7 };

    const allowed = await tryRecordDemoRun(DEMO_KEY, hashDemoIp(request), body.email);
    if (!allowed) {
        return Response.json(
            { error: "This live demo has hit today's free-run limit. Run it yourself on Apify, or check back tomorrow." },
            { status: 429 }
        );
    }

    const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_PATH}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        }
    );

    if (!apifyRes.ok) {
        return Response.json({ error: 'The actor run failed. Try again in a moment.' }, { status: 502 });
    }

    const results = await apifyRes.json();
    return Response.json({ results });
}
