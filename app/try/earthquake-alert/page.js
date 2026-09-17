import EarthquakeSearchForm from './EarthquakeSearchForm.js';

export const metadata = { title: 'Try Earthquake Alert' };

export default function TryEarthquakeAlertPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Check recent earthquakes worldwide by minimum magnitude.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/earthquake-alert" target="_blank" rel="noreferrer">
                        earthquake-alert
                    </a>{' '}
                    actor against the USGS earthquake feed, capped to a few free runs a day for
                    everyone. For your own regions and schedule, run it directly on Apify.
                </p>
            </div>

            <EarthquakeSearchForm />
        </div>
    );
}
