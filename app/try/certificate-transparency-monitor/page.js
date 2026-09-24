import { pageMeta } from '@/lib/site.js';
import CertSearchForm from './CertSearchForm.js';

export const metadata = pageMeta({
    title: "Certificate Transparency Monitor: Free Live Demo",
    description: "Search newly logged SSL certificates for a domain. Run a live demo in your browser, then use the full API on Apify for $0.007 per event.",
    path: '/try/certificate-transparency-monitor',
});

export default function TryCertMonitorPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search newly logged SSL certificates for a domain.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/certificate-transparency-monitor" target="_blank" rel="noreferrer">
                        certificate-transparency-monitor
                    </a>{' '}
                    actor against crt.sh, capped to a few free runs a day for everyone. For your own
                    domains and schedule, run it directly on Apify.
                </p>
            </div>

            <CertSearchForm />
        </div>
    );
}
