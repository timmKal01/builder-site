import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { requireAccount } from '@/lib/signals/account.js';
import { getSignalsForAccount, getMatchesForSignal } from '@/lib/signals/db.js';
import { effectivePlan, formatPrice, PRICES } from '@/lib/signals/plans.js';
import { listSources, getSource } from '@/lib/signals/sources.js';
import NewSignalForm from './NewSignalForm.js';
import { toggleSignalAction } from './actions.js';

// Leads arrive on a schedule, so a cached dashboard would show stale ones.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your signals' };

function when(value) {
    if (!value) return 'not yet';
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
}

export default async function DashboardPage() {
    // The gate lives here rather than in middleware, per Clerk's current
    // guidance: the check sits with the data it protects, so it cannot be
    // bypassed by a path the matcher failed to anticipate. requireAccount
    // returns null both when nobody is signed in and when Clerk has no email
    // for them — there is nowhere to deliver leads in either case.
    const account = await requireAccount();
    if (!account) redirect('/sign-in');

    const [signals, plan] = await Promise.all([
        getSignalsForAccount(account.id),
        Promise.resolve(effectivePlan(account)),
    ]);

    // Only the newest signal's matches are loaded up front. The dashboard is
    // a "what came in" screen, not an archive.
    const newest = signals.find((s) => Number(s.match_count) > 0);
    const matches = newest ? await getMatchesForSignal(newest.id, 20) : [];
    const matchFields = newest ? (getSource(newest.source)?.display ?? []) : [];

    const price = formatPrice(PRICES.pro[account.currency]?.monthly, account.currency);

    return (
        <div className="wrap admin-page">
            <div className="admin-toolbar">
                <div>
                    <h1 className="page-title">Your signals</h1>
                    <p className="demo-note" style={{ marginTop: 6 }}>
                        {plan.label} plan
                        {plan.lapsed && ' · lapsed, running at free limits'}
                        {' · '}
                        {signals.length} of {plan.signals} signal{plan.signals === 1 ? '' : 's'} used
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
                        Your plan has lapsed, so you are back to one weekly signal. Nothing is lost
                        — held-back matches are still waiting and arrive once you renew. {price}/month.
                    </p>
                </div>
            )}

            <NewSignalForm
                sources={listSources()}
                schedules={plan.schedules}
                atLimit={signals.length >= plan.signals}
                planLabel={plan.label}
                limit={plan.signals}
            />

            {signals.length > 0 && (
                <table className="admin-table" style={{ marginTop: 32 }}>
                    <thead>
                        <tr>
                            <th>Signal</th>
                            <th>Watching</th>
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
                                        {s.name}
                                        {parked && (
                                            <>
                                                {' '}
                                                <span className="status-pill">Over plan</span>
                                            </>
                                        )}
                                    </td>
                                    <td className="mono">{getSource(s.source)?.label ?? s.source}</td>
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

            {newest && matches.length > 0 && (
                <>
                    <h2 className="section-title" style={{ fontSize: 20, marginTop: 48 }}>
                        Latest from &ldquo;{newest.name}&rdquo;
                    </h2>
                    <div className="demo-results" style={{ marginTop: 16 }}>
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    {matchFields.map((f) => (
                                        <th key={f}>{f.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((m) => (
                                    <tr key={m.fingerprint}>
                                        {matchFields.map((f) => {
                                            const v = m.payload?.[f];
                                            return (
                                                <td key={f} className="mono">
                                                    {v == null || v === ''
                                                        ? '—'
                                                        : Array.isArray(v)
                                                          ? v.slice(0, 4).join(', ')
                                                          : String(v).slice(0, 120)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
