import { guardDemoRun } from '@/lib/demoGate.js';

const ACTOR_PATH = 'm_ctim~certificate-transparency-monitor';
const DEMO_KEY = 'certificate-transparency-monitor';
const DEMO_MAX_RESULTS = 10;

function cleanDomain(value) {
    return typeof value === 'string'
        ? value.trim().slice(0, 100).replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
        : '';
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

    const domain = cleanDomain(body.domain);
    if (!domain) {
        return Response.json({ error: 'Enter a domain.' }, { status: 400 });
    }

    const input = {
        domain,
        daysBack: 30,
        maxResults: DEMO_MAX_RESULTS,
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
