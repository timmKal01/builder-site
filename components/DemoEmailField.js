'use client';

export default function DemoEmailField({ value, onChange }) {
    return (
        <div className="demo-email-field">
            <label htmlFor="demo-email">Email</label>
            <input
                id="demo-email"
                type="email"
                required
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="you@company.com"
            />
            <span>Just so we know who's trying this out. Not shared, no spam.</span>
        </div>
    );
}
