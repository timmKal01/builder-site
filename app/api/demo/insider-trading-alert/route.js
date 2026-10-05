import { guardDemoRun } from '@/lib/demoGate.js';

const ACTOR_PATH = 'm_ctim~insider-trading-alert';
const DEMO_KEY = 'insider-trading-alert';
const DEMO_MAX_FILINGS = 10;

const ALLOWED_TYPES = new Set(['all', 'acquired', 'disposed']);

function cleanTicker(value) {
    return typeof value === 'string' ? value.trim().slice(0, 10).toUpperCase() : '';
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

    const input = {
        ticker: cleanTicker(body.ticker),
        transactionType: ALLOWED_TYPES.has(body.transactionType) ? body.transactionType : 'all',
        maxFilings: DEMO_MAX_FILINGS,
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
