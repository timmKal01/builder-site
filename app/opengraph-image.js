import { ImageResponse } from 'next/og';

// The preview card shown when a Tidefeed link is shared on X, LinkedIn,
// WhatsApp, Slack, etc. Pages without their own image inherit this one.
export const alt = 'Tidefeed: public data APIs for recalls, grants and court records';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SOURCES = ['FDA recalls', 'Federal grants', 'Court opinions', 'SEC filings', 'NPI registry', 'FINRA BrokerCheck'];

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px 80px',
                    background: '#14181b',
                    color: '#e8e6df',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: '#57bfa3' }} />
                    <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>Tidefeed</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                    <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 980 }}>
                        Public data APIs for recalls, grants &amp; court records
                    </div>
                    <div style={{ fontSize: 30, color: '#9aa3ab' }}>
                        Clean JSON from public sources. $7 per 1,000. No logins.
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {SOURCES.map((s) => (
                        <div
                            key={s}
                            style={{
                                fontSize: 22,
                                padding: '8px 16px',
                                border: '1px solid #343d43',
                                borderRadius: 4,
                                color: '#57bfa3',
                            }}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            </div>
        ),
        size
    );
}
