import { pool } from './index.js';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      content TEXT NOT NULL
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      amount NUMERIC NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS creators (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      country TEXT NOT NULL,
      specialty TEXT NOT NULL,
      is_live BOOLEAN NOT NULL DEFAULT FALSE,
      followers INTEGER NOT NULL DEFAULT 0,
      trending_score INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      last_online TIMESTAMP
    )`);
    await client.query('COMMIT');
    console.log('Migration complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed', err);
  } finally {
    client.release();
  }
}

migrate().then(() => pool.end());
