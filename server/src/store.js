// Persistence layer. Locally (no Postgres env var configured) this reads and
// writes a single JSON file, which is enough for a personal, single-machine
// app. On Vercel the filesystem is read-only/ephemeral, so when POSTGRES_URL
// (or DATABASE_URL) is present — e.g. a Vercel Postgres/Neon integration —
// the same single JSON "document" is stored in a Postgres table instead.
// Either way the rest of the app just deals in plain JS objects.

const fs = require('fs');
const path = require('path');
const { defaultDb } = require('./defaults');

const DB_PATH = path.join(__dirname, '..', 'db.json');
const CONNECTION_STRING = process.env.POSTGRES_URL || process.env.DATABASE_URL || null;

let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: CONNECTION_STRING,
      ssl: CONNECTION_STRING && CONNECTION_STRING.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    poolPromise = pool
      .query('CREATE TABLE IF NOT EXISTS lifeos_state (key TEXT PRIMARY KEY, value JSONB NOT NULL)')
      .then(() => pool);
  }
  return poolPromise;
}

async function loadDb() {
  if (CONNECTION_STRING) {
    const pool = await getPool();
    const res = await pool.query('SELECT value FROM lifeos_state WHERE key = $1', ['main']);
    if (res.rows.length === 0) {
      const fresh = defaultDb();
      await pool.query('INSERT INTO lifeos_state (key, value) VALUES ($1, $2)', ['main', fresh]);
      return fresh;
    }
    return { ...defaultDb(), ...res.rows[0].value };
  }

  if (!fs.existsSync(DB_PATH)) {
    const fresh = defaultDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    return { ...defaultDb(), ...parsed };
  } catch (e) {
    console.error('Failed to parse db.json, recreating from defaults.', e);
    const fresh = defaultDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

async function saveDb(db) {
  if (CONNECTION_STRING) {
    const pool = await getPool();
    await pool.query(
      'INSERT INTO lifeos_state (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['main', db]
    );
    return;
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

module.exports = { loadDb, saveDb };
