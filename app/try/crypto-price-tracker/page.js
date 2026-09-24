import { pageMeta } from '@/lib/site.js';
import CryptoPriceForm from './CryptoPriceForm.js';

export const metadata = pageMeta({
    title: "Crypto Price Tracker: Free Live Demo",
    description: "Check current price and 24h/7d change for a few coins. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/crypto-price-tracker',
});

export default function TryCryptoPriceTrackerPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Check current price and 24h/7d change for a few coins.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/crypto-price-tracker" target="_blank" rel="noreferrer">
                        crypto-price-tracker
                    </a>{' '}
                    actor against CoinGecko, capped to a few free runs a day for everyone. For your
                    own coin list and schedule, run it directly on Apify.
                </p>
            </div>

            <CryptoPriceForm />
        </div>
    );
}
