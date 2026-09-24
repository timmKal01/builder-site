import { pageMeta } from '@/lib/site.js';
import BriefingForm from './BriefingForm.js';

export const metadata = pageMeta({
    title: "Field Operations Risk Briefing: Free Live Demo",
    description: "Check ground weather and GPS/radio conditions together. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/field-operations-risk-briefing',
});

export default function TryFieldOpsPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Check ground weather and GPS/radio conditions together.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/field-operations-risk-briefing" target="_blank" rel="noreferrer">
                        field-operations-risk-briefing
                    </a>{' '}
                    actor, combining the NWS forecast with current space-weather
                    conditions, capped to a few free runs a day for everyone. For your
                    own locations and schedule, run it directly on Apify.
                </p>
            </div>

            <BriefingForm />
        </div>
    );
}
