import { tryRecordDemoRun, hashDemoIp, isAllowedDemoOrigin } from '@/lib/db.js';

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

    if (!isAllowedDemoOrigin(request)) {
        return Response.json({ error: 'Forbidden.' }, { status: 403 });
    }

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
