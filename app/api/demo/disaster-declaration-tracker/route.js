import { guardDemoRun } from '@/lib/demoGate.js';

const ACTOR_PATH = 'm_ctim~disaster-declaration-tracker';
const DEMO_KEY = 'disaster-declaration-tracker';
const DEMO_MAX_RESULTS = 10;

const ALLOWED_INCIDENT_TYPES = new Set([
    'Fire', 'Flood', 'Hurricane', 'Severe Storm(s)', 'Tornado', 'Snowstorm', 'Severe Ice Storm',
]);

function cleanState(value) {
    return typeof value === 'string' ? value.trim().slice(0, 2).toUpperCase() : '';
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

    const state = cleanState(body.state);
    const incidentType = ALLOWED_INCIDENT_TYPES.has(body.incidentType) ? body.incidentType : null;

    const input = {
        states: state ? [state] : [],
        incidentTypes: incidentType ? [incidentType] : [],
        daysBack: 90,
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
