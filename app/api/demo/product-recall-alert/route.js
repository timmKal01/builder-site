import { tryRecordDemoRun, hashDemoIp, isAllowedDemoOrigin } from '@/lib/db.js';

const ACTOR_PATH = 'm_ctim~product-recall-alert';
const DEMO_KEY = 'product-recall-alert';
const DEMO_MAX_RESULTS = 10;

const ALLOWED_CATEGORIES = new Set(['all', 'drug', 'food', 'device']);
const ALLOWED_CLASSIFICATIONS = new Set(['all', 'Class I', 'Class II', 'Class III']);

function clean(value, maxLength = 100) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
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

    const input = {
        category: ALLOWED_CATEGORIES.has(body.category) ? body.category : 'all',
        keyword: clean(body.keyword),
        classification: ALLOWED_CLASSIFICATIONS.has(body.classification) ? body.classification : 'all',
        daysBack: 30,
        maxResults: DEMO_MAX_RESULTS,
    };

    const allowed = await tryRecordDemoRun(DEMO_KEY, hashDemoIp(request));
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
