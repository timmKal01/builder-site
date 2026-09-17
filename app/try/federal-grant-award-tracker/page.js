import GrantSearchForm from './GrantSearchForm.js';

export const metadata = { title: 'Try Federal Grant Award Tracker' };

export default function TryGrantAwardPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search who just got federal grant funding.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/federal-grant-award-tracker" target="_blank" rel="noreferrer">
                        federal-grant-award-tracker
                    </a>{' '}
                    actor against USAspending.gov, capped to a few free runs a day for
                    everyone. For your own keywords and schedule, run it directly on
                    Apify.
                </p>
            </div>

            <GrantSearchForm />
        </div>
    );
}
