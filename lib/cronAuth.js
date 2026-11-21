// Shared by every Vercel Cron route. Cron invocations are plain HTTP requests
// to a public URL, so the shared secret is what stops anyone else triggering
// them: the signals cron spends real Apify runs and the digest cron sends real
// email.
//
// Vercel sends `Authorization: Bearer <CRON_SECRET>`. Compared with a length
// check first because timingSafeEqual throws on a length mismatch.
export async function isCronAuthorized(request) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;

    const header = request.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (token.length !== secret.length) return false;

    const { timingSafeEqual } = await import('node:crypto');
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}
