import RiverLevelSearchForm from './RiverLevelSearchForm.js';

export const metadata = { title: 'Try River Water Level Tracker' };

export default function TryRiverLevelPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Check real-time river gauge readings by state.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/river-water-level-tracker" target="_blank" rel="noreferrer">
                        river-water-level-tracker
                    </a>{' '}
                    actor against USGS Water Services, capped to a few free runs a day
                    for everyone. For your own sites and schedule, run it directly on
                    Apify.
                </p>
            </div>

            <RiverLevelSearchForm />
        </div>
    );
}
