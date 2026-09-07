import crypto from 'node:crypto';

const SESSION_COOKIE = 'session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function verifyPassword(input) {
    const expected = process.env.ADMIN_PASSWORD ?? '';
    const a = Buffer.from(String(input ?? ''));
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

function sign(value) {
    return crypto.createHmac('sha256', process.env.SESSION_SECRET ?? '').update(value).digest('hex');
}

export function createSessionCookie() {
    const expiry = String(Date.now() + SESSION_TTL_MS);
    return `${expiry}.${sign(expiry)}`;
}

export function isValidSession(cookieValue) {
    if (!cookieValue) return false;
    const [expiry, signature] = cookieValue.split('.');
    if (!expiry || !signature) return false;
    const expected = sign(expiry);
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;
    return Number(expiry) > Date.now();
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
