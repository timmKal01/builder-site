import Link from 'next/link';
import { requireSession } from '@/lib/session.js';
import { getAccounts } from '@/lib/signals/db.js';
import { effectivePlan, formatPrice, PRICES } from '@/lib/signals/plans.js';
import MarkPaidForm from './MarkPaidForm.js';

// Billing state changes the moment a payment is recorded, so there is nothing
// here worth serving from a build-time snapshot.
export const dynamic = 'force-dynamic';

function formatDate(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : '—';
}

// How long until they lapse, in whole days. Negative means already lapsed.
function daysUntil(value) {
    if (!value) return null;
    return Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
}

function Status({ account }) {
    if (account.status === 'suspended') {
        return <span className="status-pill">Suspended</span>;
    }

    const plan = effectivePlan(account);
    const days = daysUntil(account.paid_until);

    if (plan.lapsed) return <span className="status-pill">Lapsed</span>;
    if (!plan.paid) return <span className="status-pill">Free</span>;
    // Three days is the window the renewal reminder uses, so anything inside
    // it is something to chase today rather than notice next week.
    if (days != null && days <= 3) {
        return <span className="status-pill">Due in {days}d</span>;
    }
    return <span className="status-pill status-pill--live">{plan.label}</span>;
}

export default async function AdminBillingPage() {
    await requireSession();
    const accounts = await getAccounts();

    const prices = {
        USD: {
            monthly: formatPrice(PRICES.pro.USD.monthly, 'USD'),
            quarterly: formatPrice(PRICES.pro.USD.quarterly, 'USD'),
        },
        KES: {
            monthly: formatPrice(PRICES.pro.KES.monthly, 'KES'),
            quarterly: formatPrice(PRICES.pro.KES.quarterly, 'KES'),
        },
    };

    return (
        <div className="wrap">
            <div className="admin-page">
                <div className="admin-toolbar">
                    <h1 className="page-title">Billing</h1>
                    <div className="admin-toolbar__actions">
                        <Link href="/admin" className="btn btn-ghost">
                            Posts
                        </Link>
                        <Link href="/admin/leads" className="btn btn-ghost">
                            Leads
                        </Link>
                    </div>
                </div>

                <p className="demo-note" style={{ marginBottom: 24 }}>
                    Pro is {prices.USD.monthly}/mo or {prices.USD.quarterly}/quarter internationally,
                    and {prices.KES.monthly}/mo or {prices.KES.quarterly}/quarter in Kenya. Quarterly
                    exists mainly to cut the number of manual M-Pesa renewals.
                </p>

                {accounts.length === 0 ? (
                    <p className="log-empty">No accounts yet.</p>
                ) : (
                    <>
                        <MarkPaidForm
                            accounts={accounts.map((a) => ({
                                id: a.id,
                                email: a.email,
                                plan: a.plan,
                                currency: a.currency,
                            }))}
                            prices={prices}
                        />

                        <table className="admin-table" style={{ marginTop: 32 }}>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Paid until</th>
                                    <th>Signals</th>
                                    <th>Last run</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((a) => (
                                    <tr key={a.id}>
                                        <td className="mono">{a.email}</td>
                                        <td>
                                            <Status account={a} />
                                        </td>
                                        <td className="mono">{formatDate(a.paid_until)}</td>
                                        <td className="mono">{a.signal_count}</td>
                                        <td className="mono">{formatDate(a.last_run_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
}
