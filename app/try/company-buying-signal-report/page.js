import BuyingSignalForm from './BuyingSignalForm.js';

export const metadata = { title: 'Try Company Buying Signal Report' };

export default function TryBuyingSignalReportPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Combine hiring signal, tech stack, and contact info into one score.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/company-buying-signal-report" target="_blank" rel="noreferrer">
                        company-buying-signal-report
                    </a>{' '}
                    actor, capped to a few free runs a day for everyone. For a whole prospect list
                    and a saved schedule, run it directly on Apify.
                </p>
            </div>

            <BuyingSignalForm />
        </div>
    );
}
