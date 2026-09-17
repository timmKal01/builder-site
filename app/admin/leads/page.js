import Link from 'next/link';
import { requireSession } from '@/lib/session.js';
import { getDemoLeads } from '@/lib/db.js';

function formatDate(value) {
    return new Date(value).toISOString().slice(0, 16).replace('T', ' ');
}

export default async function AdminLeadsPage() {
    await requireSession();
    const leads = await getDemoLeads();

    return (
        <div className="wrap">
            <div className="admin-page">
                <div className="admin-toolbar">
                    <h1 className="page-title">Demo leads</h1>
                    <div className="admin-toolbar__actions">
                        <Link href="/admin" className="btn btn-ghost">
                            Posts
                        </Link>
                    </div>
                </div>

                {leads.length === 0 ? (
                    <p className="log-empty">No emails captured yet.</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Actor</th>
                                <th>When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead, i) => (
                                <tr key={i}>
                                    <td className="mono">{lead.email}</td>
                                    <td>{lead.demo_key}</td>
                                    <td className="mono">{formatDate(lead.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
