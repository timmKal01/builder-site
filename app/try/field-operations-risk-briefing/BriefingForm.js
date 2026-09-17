'use client';

import { useState } from 'react';

const LOCATIONS = [
    ['austin-tx', 'Austin, TX'],
    ['bakersfield-ca', 'Bakersfield, CA'],
    ['houston-tx', 'Houston, TX'],
    ['fairbanks-ak', 'Fairbanks, AK'],
    ['tampa-fl', 'Tampa, FL'],
    ['fargo-nd', 'Fargo, ND'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/field-operations-risk-briefing';

export default function BriefingForm() {
    const [locationKey, setLocationKey] = useState('austin-tx');
    const [briefing, setBriefing] = useState(null);
    const [error, setError] = useState(null);
    const [capped, setCapped] = useState(false);
    const [pending, setPending] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError(null);
        setCapped(false);
        setBriefing(null);

        try {
            const res = await fetch('/api/demo/field-operations-risk-briefing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locationKey }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setCapped(res.status === 429);
            } else {
                setBriefing(data.results?.[0] ?? null);
            }
        } catch {
            setError('Could not reach the demo. Try again in a moment.');
        } finally {
            setPending(false);
        }
    }

    const nextPeriod = briefing?.weather?.forecastPeriods?.[0];
    const auroraPossible =
        briefing?.spaceWeather?.auroraVisibleLatitude != null &&
        briefing?.latitude >= briefing.spaceWeather.auroraVisibleLatitude;

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

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Briefing…' : 'Get briefing'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Six preset US locations, live NWS and NOAA space-weather data.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run field-operations-risk-briefing on Apify with your own account for
                        unlimited locations, saved schedules, and full result sets.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {briefing && (
                <>
                    <div className="briefing-card">
                        <div className="briefing-card__head">
                            <h2>{briefing.label}</h2>
                            <span className="mono">as of {new Date(briefing.spaceWeather.observedAt).toLocaleString()}</span>
                        </div>

                        <div className="briefing-grid">
                            <div className="briefing-block">
                                <span className="briefing-block__title">Ground weather</span>
                                {nextPeriod ? (
                                    <>
                                        <p className="briefing-block__lede">
                                            {nextPeriod.name}: {nextPeriod.temperature}{'°'}F, {nextPeriod.shortForecast}
                                        </p>
                                        {briefing.weather.activeAlerts?.length > 0 ? (
                                            <p className="briefing-alert">
                                                {briefing.weather.activeAlerts.length} active NWS alert(s)
                                            </p>
                                        ) : (
                                            <p className="briefing-block__note">No active NWS alerts.</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="briefing-block__note">No forecast data returned.</p>
                                )}
                            </div>

                            <div className="briefing-block">
                                <span className="briefing-block__title">GPS / radio conditions</span>
                                <p className="briefing-block__lede">Kp index {briefing.spaceWeather.kpIndex}</p>
                                <p className="briefing-block__note">
                                    Radio blackout: {briefing.spaceWeather.radioBlackout.rScale}, {briefing.spaceWeather.radioBlackout.rScaleDescription}
                                </p>
                                <p className="briefing-block__note">
                                    Aurora {auroraPossible ? 'possible' : 'unlikely'} at this latitude tonight
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with your own locations, directly on
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
