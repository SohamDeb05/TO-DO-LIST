import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import pool, { ensureSchema } from './db.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use(
  cors({
    origin: clientOrigin,
  }),
);
app.use(express.json());

function createToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, {
    expiresIn: '7d',
  });
}

function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed.',
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password ?? '';

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );

    if (existingUser.rowCount) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insertedUser = await pool.query(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at
      `,
      [name, email, passwordHash],
    );

    const user = formatUser(insertedUser.rows[0]);
    const token = createToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    return res
      .status(500)
      .json({ message: 'Could not create account right now.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password ?? '';

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Email and password are required.' });
  }

  try {
    const userResult = await pool.query(
      `
        SELECT id, name, email, created_at, password_hash
        FROM users
        WHERE email = $1
      `,
      [email],
    );

    if (!userResult.rowCount) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const dbUser = userResult.rows[0];
    const passwordMatches = await bcrypt.compare(
      password,
      dbUser.password_hash,
    );

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = formatUser(dbUser);
    const token = createToken(user);

    return res.json({
      message: 'Logged in successfully.',
      token,
      user,
    });
  } catch {
    return res.status(500).json({ message: 'Login failed right now.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.sub],
    );

    if (!userResult.rowCount) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user: formatUser(userResult.rows[0]) });
  } catch {
    return res.status(500).json({ message: 'Could not load profile.' });
  }
});

app.put('/api/auth/me', requireAuth, async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: 'Name and email are required.' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email, req.user.sub],
    );

    if (existingUser.rowCount) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const updatedUserResult = await pool.query(
      `
        UPDATE users
        SET name = $1, email = $2
        WHERE id = $3
        RETURNING id, name, email, created_at
      `,
      [name, email, req.user.sub],
    );

    if (!updatedUserResult.rowCount) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = formatUser(updatedUserResult.rows[0]);
    const token = createToken(user);

    return res.json({
      message: 'Profile updated successfully.',
      token,
      user,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    return res.status(500).json({ message: 'Could not update profile.' });
  }
});

// ─── Todo Routes ──────────────────────────────────────────────────────────────

// GET /api/todos — list all todos for authenticated user
app.get('/api/todos', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, completed, created_at FROM todos WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.sub],
    );
    return res.json({ todos: result.rows });
  } catch {
    return res.status(500).json({ message: 'Could not fetch todos.' });
  }
});

// POST /api/todos — create a new todo
app.post('/api/todos', requireAuth, async (req, res) => {
  const title = req.body.title?.trim();
  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING id, title, completed, created_at',
      [req.user.sub, title],
    );
    return res.status(201).json({ todo: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not create todo.' });
  }
});

// PATCH /api/todos/:id — update title and/or completed
app.patch('/api/todos/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { title, completed } = req.body;
  try {
    const existing = await pool.query(
      'SELECT id FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.user.sub],
    );
    if (!existing.rowCount) {
      return res.status(404).json({ message: 'Todo not found.' });
    }
    const result = await pool.query(
      `UPDATE todos
       SET title = COALESCE($1, title),
           completed = COALESCE($2, completed)
       WHERE id = $3 AND user_id = $4
       RETURNING id, title, completed, created_at`,
      [title ?? null, completed ?? null, id, req.user.sub],
    );
    return res.json({ todo: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not update todo.' });
  }
});

// PATCH /api/todos/:id/toggle — toggle completed
app.patch('/api/todos/:id/toggle', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      `UPDATE todos
       SET completed = NOT completed
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, completed, created_at`,
      [id, req.user.sub],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Todo not found.' });
    }
    return res.json({ todo: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not toggle todo.' });
  }
});

// DELETE /api/todos/:id — delete a todo
app.delete('/api/todos/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.user.sub],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Todo not found.' });
    }
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Could not delete todo.' });
  }
});

async function start() {
  try {
    await ensureSchema();
    await pool.query('SELECT NOW()');

    app.listen(port, () => {
      console.log(`Auth API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
