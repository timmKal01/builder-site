import { tryRecordDemoRun, hashDemoIp, isAllowedDemoOrigin, isValidDemoEmail } from '@/lib/db.js';

const ACTOR_PATH = 'm_ctim~field-operations-risk-briefing';
const DEMO_KEY = 'field-operations-risk-briefing';

const PRESET_LOCATIONS = {
    'austin-tx': { label: 'Austin, TX', latitude: 30.2672, longitude: -97.7431 },
    'bakersfield-ca': { label: 'Bakersfield, CA', latitude: 35.3733, longitude: -119.0187 },
    'houston-tx': { label: 'Houston, TX', latitude: 29.7604, longitude: -95.3698 },
    'fairbanks-ak': { label: 'Fairbanks, AK', latitude: 64.8378, longitude: -147.7164 },
    'tampa-fl': { label: 'Tampa, FL', latitude: 27.9506, longitude: -82.4572 },
    'fargo-nd': { label: 'Fargo, ND', latitude: 46.8772, longitude: -96.7898 },
};

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

    const location = PRESET_LOCATIONS[body.locationKey];
    if (!location) {
        return Response.json({ error: 'Pick one of the listed locations.' }, { status: 400 });
    }

    if (!isValidDemoEmail(body.email)) {
        return Response.json({ error: 'Enter a valid email to run the demo.' }, { status: 400 });
    }

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
            body: JSON.stringify({ locations: [location], forecastPeriods: 4 }),
        }
    );

    if (!apifyRes.ok) {
        return Response.json({ error: 'The actor run failed. Try again in a moment.' }, { status: 502 });
    }

    const results = await apifyRes.json();
    return Response.json({ results });
}
