import { pageMeta } from '@/lib/site.js';
import GrantOppSearchForm from './GrantOppSearchForm.js';

export const metadata = pageMeta({
    title: "Grant Opportunity Tracker: Free Live Demo",
    description: "Search newly posted federal grant opportunities. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/grant-opportunity-tracker',
});

export default function TryGrantOppTrackerPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search newly posted federal grant opportunities.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/grant-opportunity-tracker" target="_blank" rel="noreferrer">
                        grant-opportunity-tracker
                    </a>{' '}
                    actor against Grants.gov, capped to a few free runs a day for everyone. For your
                    own keywords and schedule, run it directly on Apify.
                </p>
            </div>

            <GrantOppSearchForm />
        </div>
    );
}
