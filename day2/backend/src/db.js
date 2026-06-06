import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const ssl =
  process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false;

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'todo_app',
      ssl,
    });

export async function ensureSchema() {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Add profile_picture column if it doesn't exist
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
  `);
  // Add settings column if it doesn't exist
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
  `);
  // Todos table — owned by a user
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Add columns if they do not exist
  await pool.query(`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS important BOOLEAN NOT NULL DEFAULT FALSE;
  `);
  await pool.query(`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_date DATE;
  `);

  // List groups table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS list_groups (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Lists table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lists (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      group_id INT REFERENCES list_groups(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add list_id column to todos if it does not exist
  await pool.query(`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS list_id INT REFERENCES lists(id) ON DELETE SET NULL;
  `);

  // Add new columns for note, reminder, repeat_schedule
  await pool.query(`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS note TEXT;
  `);
  await pool.query(`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS reminder TIMESTAMPTZ;
  `);
  await pool.query(`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS repeat_schedule VARCHAR(50);
  `);
}

export default pool;
