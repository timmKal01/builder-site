import { Pool } from 'pg';
import { createHash } from 'crypto';

// Vercel serverless functions don't keep a writable local filesystem between
// invocations, so this talks to Neon Postgres (pooled connection) instead of
// the node:sqlite file this used in early local dev.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getPublishedPosts() {
    const { rows } = await pool.query('SELECT * FROM posts WHERE published = true ORDER BY created_at DESC');
    return rows;
}

export async function getAllPosts() {
    const { rows } = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    return rows;
}

export async function getPostBySlug(slug) {
    const { rows } = await pool.query('SELECT * FROM posts WHERE slug = $1', [slug]);
    return rows[0];
}

export async function getPostById(id) {
    const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    return rows[0];
}

export async function createPost({ slug, title, body, published }) {
    await pool.query('INSERT INTO posts (slug, title, body, published) VALUES ($1, $2, $3, $4)', [
        slug,
        title,
        body,
        published,
    ]);
}

export async function updatePost(id, { slug, title, body, published }) {
    await pool.query('UPDATE posts SET slug = $1, title = $2, body = $3, published = $4 WHERE id = $5', [
        slug,
        title,
        body,
        published,
        id,
    ]);
}

export async function deletePost(id) {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
}

const DEMO_DAILY_CAP = 20;
const DEMO_DAILY_CAP_PER_IP = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_DEMO_ORIGINS = new Set([
    'https://tidefeed.vercel.app',
    'https://builder-site-lovat.vercel.app',
]);

// Deliberately loose: this is a lead-capture gate, not a verification flow.
// Just enough shape-checking to reject empty/garbage input.
export function isValidDemoEmail(email) {
    return typeof email === 'string' && email.length <= 200 && EMAIL_PATTERN.test(email.trim());
}

// Distinct real-visitor leads captured through a demo's email gate, newest
// first, for the admin dashboard.
export async function getDemoLeads() {
    const { rows } = await pool.query(
        `SELECT demo_key, email, created_at FROM demo_runs WHERE email IS NOT NULL ORDER BY created_at DESC`
    );
    return rows;
}

// A demo request's IP, one-way hashed so nothing that identifies a visitor
// is ever stored, just enough to rate-limit repeat hits from the same source.
export function hashDemoIp(request) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    return createHash('sha256').update(ip).digest('hex');
}

// Rejects requests whose Origin header isn't this site (or localhost during
// dev). Requests without an Origin header (some proxies strip it) are let
// through since the per-IP cap below still bounds them either way.
export function isAllowedDemoOrigin(request) {
    const origin = request.headers.get('origin');
    if (!origin) return true;
    return ALLOWED_DEMO_ORIGINS.has(origin) || origin.startsWith('http://localhost:');
}

// Returns true and records the run if neither today's shared cap for this
// demo nor the per-IP cap has been hit, false (records nothing) otherwise.
// Keeps a public "try it live" page, whose API route is otherwise open to
// anyone including scripted requests that skip the UI entirely, from
// running up the site's own Apify usage unbounded or starving real visitors
// of their share of the daily quota.
export async function tryRecordDemoRun(demoKey, ipHash, email) {
    const { rows } = await pool.query(
        "SELECT count(*) FROM demo_runs WHERE demo_key = $1 AND created_at >= date_trunc('day', now())",
        [demoKey]
    );
    if (Number(rows[0].count) >= DEMO_DAILY_CAP) return false;

    const { rows: ipRows } = await pool.query(
        "SELECT count(*) FROM demo_runs WHERE demo_key = $1 AND ip_hash = $2 AND created_at >= date_trunc('day', now())",
        [demoKey, ipHash]
    );
    if (Number(ipRows[0].count) >= DEMO_DAILY_CAP_PER_IP) return false;

    await pool.query('INSERT INTO demo_runs (demo_key, ip_hash, email) VALUES ($1, $2, $3)', [
        demoKey,
        ipHash,
        email.trim().toLowerCase(),
    ]);
    return true;
}
