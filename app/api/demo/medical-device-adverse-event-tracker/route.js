import { guardDemoRun } from '@/lib/demoGate.js';

const ACTOR_PATH = 'm_ctim~medical-device-adverse-event-tracker';
const DEMO_KEY = 'medical-device-adverse-event-tracker';
const DEMO_MAX_RESULTS = 10;

const ALLOWED_EVENT_TYPES = new Set(['all', 'Malfunction', 'Injury', 'Death']);

function clean(value, maxLength = 100) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
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
        deviceName: clean(body.deviceName),
        eventType: ALLOWED_EVENT_TYPES.has(body.eventType) ? body.eventType : 'all',
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
