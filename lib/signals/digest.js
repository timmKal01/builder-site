// The Monday email: who gets it, and handing it to Resend.
//
// Rendering stays in email.js. This file is the part that touches the outside
// world, kept small and with `fetch` passed in, so the tests can check exactly
// what would be sent without a network or a real key.

const RESEND_URL = 'https://api.resend.com/emails';

// A saved search names who it goes to. Older rows, and anything hand-edited,
// may hold nothing usable, so the account's own address is the fallback: a
// customer who saved a search should never silently get no email at all.
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const MAX_RECIPIENTS = 5;

export function digestRecipients(signal) {
    const listed = Array.isArray(signal?.deliver_to) ? signal.deliver_to : [];
    const candidates = listed.length ? listed : [signal?.account_email];
    const seen = new Set();
    const out = [];
    for (const raw of candidates) {
        if (typeof raw !== 'string') continue;
        const email = raw.trim();
        const key = email.toLowerCase();
        if (!EMAIL_RE.test(email) || seen.has(key)) continue;
        seen.add(key);
        out.push(email);
        if (out.length === MAX_RECIPIENTS) break;
    }
    return out;
}

// The Monday a date falls in (UTC), as YYYY-MM-DD. Used for the idempotency
// key, so a cron that fires twice in one week cannot send the same digest twice.
export function weekOf(date = new Date()) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const sinceMonday = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - sinceMonday);
    return d.toISOString().slice(0, 10);
}

export function emailConfig(env = process.env) {
    const apiKey = env.RESEND_API_KEY?.trim();
    const from = env.EMAIL_FROM?.trim();
    return apiKey && from ? { apiKey, from } : null;
}

export class EmailSendError extends Error {
    constructor(message, { status, retryable } = {}) {
        super(message);
        this.name = 'EmailSendError';
        this.status = status;
        // 429 and 5xx are worth another go next week; a 4xx (bad address,
        // unverified domain) will fail the same way every time.
        this.retryable = Boolean(retryable);
    }
}

export async function sendDigest({ config, to, subject, html, text, idempotencyKey }, fetchImpl = fetch) {
    const response = await fetchImpl(RESEND_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ from: config.from, to, subject, html, text }),
    });

    if (!response.ok) {
        let detail = '';
        try {
            const body = await response.json();
            detail = body?.message || body?.name || '';
        } catch {
            // Not JSON; the status is all there is to report.
        }
        throw new EmailSendError(`Resend answered ${response.status}${detail ? `: ${detail}` : ''}`, {
            status: response.status,
            retryable: response.status === 429 || response.status >= 500,
        });
    }

    const body = await response.json().catch(() => ({}));
    return body?.id ?? null;
}
