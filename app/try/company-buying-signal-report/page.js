import { pageMeta } from '@/lib/site.js';
import BuyingSignalForm from './BuyingSignalForm.js';

export const metadata = pageMeta({
    title: "Company Buying Signal Report: Free Live Demo",
    description: "Combine hiring signal, tech stack, and contact info into one score. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/company-buying-signal-report',
});

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
