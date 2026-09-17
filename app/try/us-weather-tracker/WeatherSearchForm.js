'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const LOCATIONS = [
    ['austin-tx', 'Austin, TX'],
    ['seattle-wa', 'Seattle, WA'],
    ['miami-fl', 'Miami, FL'],
    ['denver-co', 'Denver, CO'],
    ['chicago-il', 'Chicago, IL'],
    ['phoenix-az', 'Phoenix, AZ'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/us-weather-tracker';

export default function WeatherSearchForm() {
    const [locationKey, setLocationKey] = useState('austin-tx');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [capped, setCapped] = useState(false);
    const [pending, setPending] = useState(false);
    const [email, setEmail] = useDemoEmail();

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError(null);
        setCapped(false);
        setWeather(null);

        try {
            const res = await fetch('/api/demo/us-weather-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locationKey, email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setCapped(res.status === 429);
            } else {
                setWeather(data.results?.[0] ?? null);
            }
        } catch {
            setError('Could not reach the demo. Try again in a moment.');
        } finally {
            setPending(false);
        }
    }

    const nextPeriod = weather?.forecastPeriods?.[0];

    return (
        <div className="demo-panel">
            <form onSubmit={handleSubmit} className="demo-form">
                <div className="form-field">
                    <label htmlFor="location">Location</label>
                    <select id="location" value={locationKey} onChange={(e) => setLocationKey(e.target.value)}>
                        {LOCATIONS.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Checking…' : 'Check forecast'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Six preset US locations, live NWS data.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run us-weather-tracker on Apify with your own account for any US
                        coordinates and a saved schedule.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {weather && (
                <>
                    <div className="briefing-card">
                        <div className="briefing-card__head">
                            <h2>{weather.city ? `${weather.city}, ${weather.state}` : weather.label}</h2>
                            <span className="mono">{weather.timeZone}</span>
                        </div>

                        <div className="briefing-grid">
                            <div className="briefing-block">
                                <span className="briefing-block__title">Forecast</span>
                                {nextPeriod ? (
                                    <p className="briefing-block__lede">
                                        {nextPeriod.name}: {nextPeriod.temperature}{'°'}F, {nextPeriod.shortForecast}
                                    </p>
                                ) : (
                                    <p className="briefing-block__note">No forecast data returned.</p>
                                )}
                            </div>

                            <div className="briefing-block">
                                <span className="briefing-block__title">Alerts</span>
                                {weather.activeAlerts?.length > 0 ? (
                                    <p className="briefing-alert">{weather.activeAlerts.length} active NWS alert(s)</p>
                                ) : (
                                    <p className="briefing-block__note">No active NWS alerts.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with any US coordinates, directly on
                            Apify.
                        </p>
                        <div className="demo-cta__actions">
                            <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                                Run it on Apify
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
