import { Pool } from 'pg';

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

// Returns true and records the run if today's cap for this demo hasn't been
// hit yet, false (records nothing) if it has. Keeps a public "try it live"
// page from running up the site's own Apify bill unbounded.
export async function tryRecordDemoRun(demoKey) {
    const { rows } = await pool.query(
        "SELECT count(*) FROM demo_runs WHERE demo_key = $1 AND created_at >= date_trunc('day', now())",
        [demoKey]
    );
    if (Number(rows[0].count) >= DEMO_DAILY_CAP) return false;

    await pool.query('INSERT INTO demo_runs (demo_key) VALUES ($1)', [demoKey]);
    return true;
}
