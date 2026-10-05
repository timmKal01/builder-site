import { guardDemoRun } from '@/lib/demoGate.js';

const ACTOR_PATH = 'm_ctim~website-lead-extractor';
const DEMO_KEY = 'website-lead-extractor';

function cleanUrl(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim().slice(0, 300);
    return /^https?:\/\//i.test(trimmed) ? trimmed : trimmed ? `https://${trimmed}` : '';
}

export async function POST(request) {
    if (!process.env.APIFY_TOKEN) {
        return Response.json({ error: 'Demo is not configured on this deployment.' }, { status: 500 });
    }

    const gate = await guardDemoRun(request, DEMO_KEY);
    if (!gate.ok) return gate.response;

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const url = cleanUrl(body.url);
    if (!url) {
        return Response.json({ error: 'Enter a website URL.' }, { status: 400 });
    }

    const input = {
        startUrls: [{ url }],
        maxDepth: 1,
        maxPagesPerDomain: 5,
    };

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
