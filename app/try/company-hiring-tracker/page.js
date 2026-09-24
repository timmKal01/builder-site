import { pageMeta } from '@/lib/site.js';
import HiringSearchForm from './HiringSearchForm.js';

export const metadata = pageMeta({
    title: "Company Hiring Tracker: Free Live Demo",
    description: "Pull a company's open roles straight from their job board. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/company-hiring-tracker',
});

export default function TryHiringTrackerPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Pull a company's open roles straight from their job board.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/company-hiring-tracker" target="_blank" rel="noreferrer">
                        company-hiring-tracker
                    </a>{' '}
                    actor against Greenhouse or Lever, capped to a few free runs a day for everyone.
                    For multiple boards and a saved schedule, run it directly on Apify.
                </p>
            </div>

            <HiringSearchForm />
        </div>
    );
}
