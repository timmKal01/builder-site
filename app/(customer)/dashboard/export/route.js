import { requireAccount } from '@/lib/signals/account.js';
import { getSignalForAccount, getMatchesForSignal } from '@/lib/signals/db.js';
import { leadsToCsv, csvFileName } from '@/lib/signals/leads.js';

// Every lead a search has delivered, as a CSV download. Scoped to the signed-in account: a search id in the URL
// is never enough to read someone else's leads.
export const dynamic = 'force-dynamic';

const MAX_ROWS = 20_000;

export async function GET(request) {
    const account = await requireAccount();
    if (!account) return new Response('Sign in to download your leads.', { status: 401 });

    const signalId = Number(new URL(request.url).searchParams.get('signal'));
    if (!Number.isInteger(signalId)) return new Response('Which search? Add ?signal=<id>.', { status: 400 });

    const signal = await getSignalForAccount(signalId, account.id);
    if (!signal) return new Response('No such search on your account.', { status: 404 });

    const matches = await getMatchesForSignal(signalId, MAX_ROWS);
    return new Response(leadsToCsv(matches.map((m) => m.payload)), {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${csvFileName(signal.name)}"`,
            'Cache-Control': 'no-store',
        },
    });
}
