import DeviceEventSearchForm from './DeviceEventSearchForm.js';

export const metadata = { title: 'Try Medical Device Adverse Event Tracker' };

export default function TryMaudePage() {
    return (
        <div className="wrap">
            <div className="demo-intro">
                <p className="hero__eyebrow">live demo · no account needed</p>
                <h1 className="hero__title">Search FDA MAUDE adverse event reports by device.</h1>
                <p className="hero__lede">
                    This calls the real{' '}
                    <a href="https://apify.com/m_ctim/medical-device-adverse-event-tracker" target="_blank" rel="noreferrer">
                        medical-device-adverse-event-tracker
                    </a>{' '}
                    actor against openFDA, capped to a few free runs a day for everyone.
                    For your own devices and schedule, run it directly on Apify.
                </p>
            </div>

            <DeviceEventSearchForm />
        </div>
    );
}
