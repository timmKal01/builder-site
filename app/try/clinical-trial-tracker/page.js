import { pageMeta } from '@/lib/site.js';
import TrialSearchForm from './TrialSearchForm.js';

export const metadata = pageMeta({
    title: "Clinical Trial Tracker: Free Live Demo",
    description: "Search new clinical trials by sponsor or condition. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/clinical-trial-tracker',
});

export default function TryClinicalTrialTrackerPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search new clinical trials by sponsor or condition.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/clinical-trial-tracker" target="_blank" rel="noreferrer">
                        clinical-trial-tracker
                    </a>{' '}
                    actor against ClinicalTrials.gov, capped to a few free runs a day for
                    everyone. For your own recurring searches, run it directly on Apify —
                    it&apos;s billed per search, not per subscription.
                </p>
            </div>

            <TrialSearchForm />
        </div>
    );
}
