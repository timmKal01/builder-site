import ContractSearchForm from './ContractSearchForm.js';

export const metadata = { title: 'Try Federal Contract Win Finder' };

export default function TryFederalContractPage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search who just won a federal contract.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/federal-contract-award-tracker" target="_blank" rel="noreferrer">
                        federal-contract-award-tracker
                    </a>{' '}
                    actor against USAspending.gov, capped to a few free runs a day for
                    everyone. For your own NAICS codes and schedule, run it directly on
                    Apify.
                </p>
            </div>

            <ContractSearchForm />
        </div>
    );
}
