import { pageMeta } from '@/lib/site.js';
import DeclarationSearchForm from './DeclarationSearchForm.js';

export const metadata = pageMeta({
    title: "Disaster Declaration Tracker: Free Live Demo",
    description: "Search new FEMA disaster declarations. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/disaster-declaration-tracker',
});

export default function TryFemaPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search new FEMA disaster declarations.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/disaster-declaration-tracker" target="_blank" rel="noreferrer">
                        disaster-declaration-tracker
                    </a>{' '}
                    actor against OpenFEMA, capped to a few free runs a day for everyone.
                    For your own states and schedule, run it directly on Apify.
                </p>
            </div>

            <DeclarationSearchForm />
        </div>
    );
}
