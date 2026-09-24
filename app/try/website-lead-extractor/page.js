import { pageMeta } from '@/lib/site.js';
import LeadExtractorForm from './LeadExtractorForm.js';

export const metadata = pageMeta({
    title: "Website Lead Extractor: Free Live Demo",
    description: "Pull emails, phones, and social links off a site. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/website-lead-extractor',
});

export default function TryLeadExtractorPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Pull emails, phones, and social links off a site.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/website-lead-extractor" target="_blank" rel="noreferrer">
                        website-lead-extractor
                    </a>{' '}
                    actor, crawling a few pages of the given site, capped to a few free runs a day
                    for everyone. For your own crawl depth and page list, run it directly on Apify.
                </p>
            </div>

            <LeadExtractorForm />
        </div>
    );
}
