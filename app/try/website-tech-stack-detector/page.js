import TechStackForm from './TechStackForm.js';

export const metadata = { title: 'Try Website Tech Stack Detector' };

export default function TryTechStackPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Find the CMS, JS framework, and CDN behind any site.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/website-tech-stack-detector" target="_blank" rel="noreferrer">
                        website-tech-stack-detector
                    </a>{' '}
                    actor from a single HTTP request, capped to a few free runs a day for everyone.
                    For batches of sites and a saved schedule, run it directly on Apify.
                </p>
            </div>

            <TechStackForm />
        </div>
    );
}
