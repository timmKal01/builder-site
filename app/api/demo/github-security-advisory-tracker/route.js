import { guardDemoRun } from '@/lib/demoGate.js';

const ACTOR_PATH = 'm_ctim~github-security-advisory-tracker';
const DEMO_KEY = 'github-security-advisory-tracker';
const DEMO_MAX_RESULTS = 10;

const ALLOWED_ECOSYSTEMS = new Set([
    'all', 'npm', 'pip', 'maven', 'nuget', 'composer', 'rubygems', 'go', 'rust', 'actions', 'pub', 'swift', 'erlang',
]);
const ALLOWED_SEVERITIES = new Set(['all', 'low', 'medium', 'high', 'critical']);

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
        ecosystem: ALLOWED_ECOSYSTEMS.has(body.ecosystem) ? body.ecosystem : 'all',
        packageName: clean(body.packageName),
        severity: ALLOWED_SEVERITIES.has(body.severity) ? body.severity : 'all',
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
