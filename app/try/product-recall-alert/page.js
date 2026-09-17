import RecallSearchForm from './RecallSearchForm.js';

export const metadata = { title: 'Try Product Recall Alert' };

export default function TryRecallPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search FDA drug, food, and device recalls in one query.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/product-recall-alert" target="_blank" rel="noreferrer">
                        product-recall-alert
                    </a>{' '}
                    actor against openFDA, capped to a few free runs a day for everyone.
                    For your own keywords and schedule, run it directly on Apify.
                </p>
            </div>

            <RecallSearchForm />
        </div>
    );
}
