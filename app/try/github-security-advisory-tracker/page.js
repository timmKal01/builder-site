import { pageMeta } from '@/lib/site.js';
import AdvisorySearchForm from './AdvisorySearchForm.js';

export const metadata = pageMeta({
    title: "GitHub Security Advisory Tracker: Free Live Demo",
    description: "Search GitHub security advisories by ecosystem and package. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/github-security-advisory-tracker',
});

export default function TryAdvisoryTrackerPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search GitHub security advisories by ecosystem and package.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/github-security-advisory-tracker" target="_blank" rel="noreferrer">
                        github-security-advisory-tracker
                    </a>{' '}
                    actor against the GitHub Advisory Database, capped to a few free runs a day for
                    everyone. For your own packages and schedule, run it directly on Apify.
                </p>
            </div>

            <AdvisorySearchForm />
        </div>
    );
}
