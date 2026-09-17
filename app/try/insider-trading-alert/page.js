import InsiderSearchForm from './InsiderSearchForm.js';

export const metadata = { title: 'Try Insider Trading Alert' };

export default function TryInsiderTradingAlertPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Check recent insider Form 4 transactions.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/insider-trading-alert" target="_blank" rel="noreferrer">
                        insider-trading-alert
                    </a>{' '}
                    actor against SEC EDGAR, capped to a few free runs a day for everyone. For your
                    own tickers and schedule, run it directly on Apify.
                </p>
            </div>

            <InsiderSearchForm />
        </div>
    );
}
