import { pageMeta } from '@/lib/site.js';
import NpmStatsForm from './NpmStatsForm.js';

export const metadata = pageMeta({
    title: "NPM Download Stats Tracker: Free Live Demo",
    description: "Compare npm download counts, this period vs. last. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/npm-download-stats-tracker',
});

export default function TryNpmStatsPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Compare npm download counts, this period vs. last.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/npm-download-stats-tracker" target="_blank" rel="noreferrer">
                        npm-download-stats-tracker
                    </a>{' '}
                    actor against the npm registry, capped to a few free runs a day for everyone.
                    For your own packages and schedule, run it directly on Apify.
                </p>
            </div>

            <NpmStatsForm />
        </div>
    );
}
