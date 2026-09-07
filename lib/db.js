import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// Local file-based store for now, using Node's built-in SQLite (no native
// build step needed). Swap this module for a hosted Postgres client before
// deploying to Vercel — serverless functions don't keep a writable local
// filesystem between invocations.
const db = new DatabaseSync(path.join(process.cwd(), 'data', 'builder-site.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export function getPublishedPosts() {
    return db.prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC').all();
}

export function getAllPosts() {
    return db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
}

export function getPostBySlug(slug) {
    return db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
}

export function getPostById(id) {
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
}

export function createPost({ slug, title, body, published }) {
    return db
        .prepare('INSERT INTO posts (slug, title, body, published) VALUES (?, ?, ?, ?)')
        .run(slug, title, body, published ? 1 : 0);
}

export function updatePost(id, { slug, title, body, published }) {
    return db
        .prepare('UPDATE posts SET slug = ?, title = ?, body = ?, published = ? WHERE id = ?')
        .run(slug, title, body, published ? 1 : 0, id);
}

export function deletePost(id) {
    return db.prepare('DELETE FROM posts WHERE id = ?').run(id);
}
