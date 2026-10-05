import { guardDemoRun } from '@/lib/demoGate.js';

const ACTOR_PATH = 'm_ctim~crypto-price-tracker';
const DEMO_KEY = 'crypto-price-tracker';

const ALLOWED_COINS = new Set(['bitcoin', 'ethereum', 'solana', 'dogecoin', 'cardano', 'ripple']);

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

    const coinIds = Array.isArray(body.coinIds)
        ? body.coinIds.filter((c) => ALLOWED_COINS.has(c)).slice(0, 6)
        : [];
    if (coinIds.length === 0) {
        return Response.json({ error: 'Pick at least one coin.' }, { status: 400 });
    }

    const input = { coinIds, vsCurrency: 'usd' };

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
