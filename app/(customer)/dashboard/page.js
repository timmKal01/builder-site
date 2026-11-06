import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { requireAccount } from '@/lib/signals/account.js';
import { getSignalsForAccount, getMatchesForSignal, countDeliveredThisMonth } from '@/lib/signals/db.js';
import { effectivePlan, formatPrice, PRICES, PLANS } from '@/lib/signals/plans.js';
import { BUSINESS_TYPES, describeSearch } from '@/lib/signals/gapFinder.js';
import { WEBSITE_STATUS } from '@/lib/signals/leads.js';
import NewSignalForm from './NewSignalForm.js';
import { toggleSignalAction } from './actions.js';

// Leads arrive on a schedule, so a cached dashboard would show stale ones.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your web design leads' };

const LEADS_SHOWN = 50;

function when(value) {
    if (!value) return 'not yet';
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
}

function phoneLink(phone) {
    return phone ? <a href={`tel:${String(phone).replace(/[^\d+]/g, '')}`}>{phone}</a> : '—';
}

export default async function DashboardPage({ searchParams }) {
    // The gate lives here rather than in middleware, per Clerk's current
    // guidance: the check sits with the data it protects, so it cannot be
    // bypassed by a path the matcher failed to anticipate. requireAccount
    // returns null both when nobody is signed in and when Clerk has no email
    // for them — there is nowhere to deliver leads in either case.
    const account = await requireAccount();
    if (!account) redirect('/sign-in');

    const plan = effectivePlan(account);
    const [signals, deliveredThisMonth] = await Promise.all([
        getSignalsForAccount(account.id),
        countDeliveredThisMonth(account.id),
    ]);

    // Which search's leads to show: the one picked in the table, or the newest one that has leads.
    const { signal: picked } = (await searchParams) ?? {};
    const selected =
        signals.find((s) => String(s.id) === String(picked)) ?? signals.find((s) => Number(s.match_count) > 0) ?? null;
    const matches = selected ? await getMatchesForSignal(selected.id, LEADS_SHOWN) : [];

    const currency = account.currency === 'KES' ? 'KES' : 'USD';
    const price = formatPrice(PRICES.pro[currency]?.monthly, currency);

    return (
        <div className="wrap admin-page">
            <div className="admin-toolbar">
                <div>
                    <h1 className="page-title">Your web design leads</h1>
                    <p className="demo-note" style={{ marginTop: 6 }}>
                        {plan.label} plan
                        {plan.lapsed && ' · lapsed, running at free limits'}
                        {' · '}
                        {signals.length} of {plan.signals} search{plan.signals === 1 ? '' : 'es'}
                        {' · '}
                        {deliveredThisMonth} of {plan.maxNewPerMonth} leads this month
                    </p>
                </div>
                <div className="admin-toolbar__actions">
                    <UserButton />
                </div>
            </div>

            {plan.lapsed && (
                <div className="demo-cta" style={{ marginBottom: 24 }}>
                    <p className="demo-cta__title">Renew to pick up where you left off</p>
                    <p className="demo-cta__body">
                        Your plan has lapsed, so you are back to one weekly search in one city. Nothing is lost:
                        your searches and the leads already sent stay here. {price} a month.
                    </p>
                </div>
            )}

            {!plan.paid && !plan.lapsed && (
                <div className="demo-cta" style={{ marginBottom: 24 }}>
                    <p className="demo-cta__title">Pro: {price} a month</p>
                    <p className="demo-cta__body">
                        {PLANS.pro.signals} searches, up to {PLANS.pro.cities} cities each, daily or weekly, and up to{' '}
                        {PLANS.pro.maxNewPerMonth.toLocaleString('en-US')} new leads a month. Card and M-Pesa payment opens soon.
                    </p>
                </div>
            )}

            <NewSignalForm
                businessTypes={BUSINESS_TYPES}
                schedules={plan.schedules}
                maxCities={plan.cities}
                atLimit={signals.length >= plan.signals}
                planLabel={plan.label}
                limit={plan.signals}
            />

            {signals.length > 0 && (
                <table className="admin-table" style={{ marginTop: 32 }}>
                    <thead>
                        <tr>
                            <th>Search</th>
                            <th>Looking for</th>
                            <th>Every</th>
                            <th>Leads</th>
                            <th>Last run</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {signals.map((s) => {
                            const parked = Number(s.slot) > plan.signals;
                            return (
                                <tr key={s.id}>
                                    <td>
                                        <Link href={`/dashboard?signal=${s.id}`}>{s.name}</Link>
                                        {parked && (
                                            <>
                                                {' '}
                                                <span className="status-pill">Over plan</span>
                                            </>
                                        )}
                                        {!s.active && (
                                            <>
                                                {' '}
                                                <span className="status-pill">Paused</span>
                                            </>
                                        )}
                                    </td>
                                    <td>{describeSearch(s.input)}</td>
                                    <td className="mono">{s.schedule}</td>
                                    <td className="mono">{s.match_count}</td>
                                    <td className="mono">{when(s.last_attempt)}</td>
                                    <td>
                                        <form action={toggleSignalAction} className="admin-row-actions">
                                            <input type="hidden" name="signalId" value={s.id} />
                                            <input type="hidden" name="active" value={String(!s.active)} />
                                            <button className="btn btn-ghost" type="submit">
                                                {s.active ? 'Pause' : 'Resume'}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {selected && (
                <>
                    <div className="admin-toolbar" style={{ marginTop: 48 }}>
                        <h2 className="section-title" style={{ fontSize: 20 }}>
                            Leads from &ldquo;{selected.name}&rdquo;
                        </h2>
                        {Number(selected.match_count) > 0 && (
                            <a className="btn btn-ghost" href={`/dashboard/export?signal=${selected.id}`}>
                                Download all {selected.match_count} as CSV
                            </a>
                        )}
                    </div>
                    {matches.length === 0 ? (
                        <p className="demo-note" style={{ marginTop: 12 }}>
                            No leads yet. The first run happens on the next scheduled pass.
                        </p>
                    ) : (
                        <div className="demo-results" style={{ marginTop: 16 }}>
                            <table className="demo-table">
                                <thead>
                                    <tr>
                                        <th>Business</th>
                                        <th>City</th>
                                        <th>Score</th>
                                        <th>Website</th>
                                        <th>Problems found</th>
                                        <th>Pitch line</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map(({ fingerprint, payload: r = {} }) => (
                                        <tr key={fingerprint}>
                                            <td>
                                                {r.mapsUrl ? (
                                                    <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer">
                                                        {r.name ?? 'Unnamed business'}
                                                    </a>
                                                ) : (
                                                    r.name ?? '—'
                                                )}
                                            </td>
                                            <td>{r.city ?? '—'}</td>
                                            <td className="mono">{r.opportunityScore ?? '—'}</td>
                                            <td>
                                                {r.websiteUrl && r.websiteStatus !== 'none' ? (
                                                    <a href={r.websiteUrl} target="_blank" rel="noopener noreferrer nofollow">
                                                        {WEBSITE_STATUS[r.websiteStatus] ?? r.websiteStatus}
                                                    </a>
                                                ) : (
                                                    WEBSITE_STATUS[r.websiteStatus] ?? r.websiteStatus ?? '—'
                                                )}
                                            </td>
                                            <td>{Array.isArray(r.opportunityReasons) ? r.opportunityReasons.slice(0, 3).join('; ') : '—'}</td>
                                            <td>{r.pitchAngle ?? '—'}</td>
                                            <td className="mono">{phoneLink(r.phone)}</td>
                                            <td className="mono">
                                                {r.publicEmail ? <a href={`mailto:${r.publicEmail}`}>{r.publicEmail}</a> : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
