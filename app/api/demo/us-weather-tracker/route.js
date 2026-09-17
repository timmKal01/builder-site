import { tryRecordDemoRun, hashDemoIp, isAllowedDemoOrigin, isValidDemoEmail } from '@/lib/db.js';

const ACTOR_PATH = 'm_ctim~us-weather-tracker';
const DEMO_KEY = 'us-weather-tracker';

const PRESET_LOCATIONS = {
    'austin-tx': { label: 'Austin, TX', latitude: 30.2672, longitude: -97.7431 },
    'seattle-wa': { label: 'Seattle, WA', latitude: 47.6062, longitude: -122.3321 },
    'miami-fl': { label: 'Miami, FL', latitude: 25.7617, longitude: -80.1918 },
    'denver-co': { label: 'Denver, CO', latitude: 39.7392, longitude: -104.9903 },
    'chicago-il': { label: 'Chicago, IL', latitude: 41.8781, longitude: -87.6298 },
    'phoenix-az': { label: 'Phoenix, AZ', latitude: 33.4484, longitude: -112.0740 },
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

    const input = { locations: [location], forecastPeriods: 4 };

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
            body: JSON.stringify(input),
        }
    );

    if (!apifyRes.ok) {
        return Response.json({ error: 'The actor run failed. Try again in a moment.' }, { status: 502 });
    }

    const results = await apifyRes.json();
    return Response.json({ results });
}
