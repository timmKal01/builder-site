// Run with: node --env-file=.env.local scripts/migrate.js
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

// Tracks calls made through a public "try it live" demo page so the site's
// own Apify token can be capped per day instead of a visitor paying nothing
// and running it unlimited times.
await pool.query(`
  CREATE TABLE IF NOT EXISTS demo_runs (
    id SERIAL PRIMARY KEY,
    demo_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);
await pool.query(`
  CREATE INDEX IF NOT EXISTS demo_runs_key_created_idx ON demo_runs (demo_key, created_at)
`);

console.log('migrated');
await pool.end();
