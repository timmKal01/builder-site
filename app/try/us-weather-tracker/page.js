import WeatherSearchForm from './WeatherSearchForm.js';

export const metadata = { title: 'Try US Weather Tracker' };

export default function TryUsWeatherTrackerPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Check the National Weather Service forecast for a US location.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/us-weather-tracker" target="_blank" rel="noreferrer">
                        us-weather-tracker
                    </a>{' '}
                    actor against the NWS, capped to a few free runs a day for everyone. For your own
                    coordinates and schedule, run it directly on Apify.
                </p>
            </div>

            <WeatherSearchForm />
        </div>
    );
}
