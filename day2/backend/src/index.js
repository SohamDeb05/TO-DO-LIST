import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import pool, { ensureSchema } from './db.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const port = Number(process.env.PORT || 4001);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5174';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use(cors({ origin: '*' })); // Allow all origins for easier deployment
app.use(express.json({ limit: '5mb' }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    profilePicture: row.profile_picture,
    createdAt: row.created_at,
  };
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', message: 'Database connection failed.' });
  }
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password ?? '';

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email, and password are required.' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rowCount)
      return res.status(409).json({ message: 'Email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, profile_picture, created_at',
      [name, email, passwordHash],
    );

    const user = formatUser(result.rows[0]);
    return res.status(201).json({ message: 'Account created.', token: createToken(user), user });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ message: 'Email is already registered.' });
    return res.status(500).json({ message: 'Could not create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password ?? '';

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at, profile_picture, password_hash FROM users WHERE email = $1',
      [email],
    );
    if (!result.rowCount)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const dbUser = result.rows[0];
    const ok = await bcrypt.compare(password, dbUser.password_hash);
    if (!ok)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const user = formatUser(dbUser);
    return res.json({ message: 'Logged in.', token: createToken(user), user });
  } catch {
    return res.status(500).json({ message: 'Login failed.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, profile_picture, created_at FROM users WHERE id = $1',
      [req.user.sub],
    );
    if (!result.rowCount)
      return res.status(404).json({ message: 'User not found.' });
    return res.json({ user: formatUser(result.rows[0]) });
  } catch {
    return res.status(500).json({ message: 'Could not load profile.' });
  }
});

app.put('/api/auth/profile', requireAuth, async (req, res) => {
  const name = req.body.name?.trim();
  const profilePicture = req.body.profilePicture; // Expected to be base64 data URI

  if (!name) return res.status(400).json({ message: 'Name is required' });

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, profile_picture = $2 WHERE id = $3 RETURNING id, name, email, profile_picture, created_at',
      [name, profilePicture, req.user.sub]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    
    return res.json({ message: 'Profile updated.', user: formatUser(result.rows[0]) });
  } catch (err) {
    return res.status(500).json({ message: 'Could not update profile.' });
  }
});

// ─── Settings Routes ────────────────────────────────────────────────────────────

// GET /api/settings
app.get('/api/settings', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT settings FROM users WHERE id = $1', [req.user.sub]);
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    return res.json({ settings: result.rows[0].settings || {} });
  } catch (err) {
    return res.status(500).json({ message: 'Could not fetch settings.' });
  }
});

// PUT /api/settings
app.put('/api/settings', requireAuth, async (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ message: 'Invalid settings object' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET settings = $1 WHERE id = $2 RETURNING settings',
      [settings, req.user.sub]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    return res.json({ settings: result.rows[0].settings });
  } catch (err) {
    return res.status(500).json({ message: 'Could not update settings.' });
  }
});

// ─── Todo Routes ──────────────────────────────────────────────────────────────

// GET /api/todos — list all todos for authenticated user
app.get('/api/todos', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, completed, important, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, list_id, note, reminder, repeat_schedule, created_at FROM todos WHERE user_id = $1 ORDER BY created_at ASC",
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
  const important = req.body.important === true;
  const due_date = req.body.due_date || null;
  const list_id = req.body.list_id || null;
  const note = req.body.note || null;
  const reminder = req.body.reminder || null;
  const repeat_schedule = req.body.repeat_schedule || null;
  if (!title)
    return res.status(400).json({ message: 'Title is required.' });

  try {
    const result = await pool.query(
      "INSERT INTO todos (user_id, title, important, due_date, list_id, note, reminder, repeat_schedule) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, title, completed, important, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, list_id, note, reminder, repeat_schedule, created_at",
      [req.user.sub, title, important, due_date, list_id, note, reminder, repeat_schedule],
    );
    return res.status(201).json({ todo: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not create todo.' });
  }
});

// PATCH /api/todos/:id — update todo fields
app.patch('/api/todos/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { title, completed, important, due_date, list_id, note, reminder, repeat_schedule } = req.body;

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (completed !== undefined) {
      fields.push(`completed = $${idx++}`);
      values.push(completed);
    }
    if (important !== undefined) {
      fields.push(`important = $${idx++}`);
      values.push(important);
    }
    if (due_date !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(due_date);
    }
    if (list_id !== undefined) {
      fields.push(`list_id = $${idx++}`);
      values.push(list_id);
    }
    if (note !== undefined) {
      fields.push(`note = $${idx++}`);
      values.push(note);
    }
    if (reminder !== undefined) {
      fields.push(`reminder = $${idx++}`);
      values.push(reminder);
    }
    if (repeat_schedule !== undefined) {
      fields.push(`repeat_schedule = $${idx++}`);
      values.push(repeat_schedule);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    values.push(id, req.user.sub);
    const query = `
      UPDATE todos
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND user_id = $${idx++}
      RETURNING id, title, completed, important, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, list_id, note, reminder, repeat_schedule, created_at
    `;
    const result = await pool.query(query, values);
    if (!result.rowCount)
      return res.status(404).json({ message: 'Todo not found.' });
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
      `UPDATE todos SET completed = NOT completed
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, completed, important, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, list_id, note, reminder, repeat_schedule, created_at`,
      [id, req.user.sub],
    );
    if (!result.rowCount)
      return res.status(404).json({ message: 'Todo not found.' });
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
    if (!result.rowCount)
      return res.status(404).json({ message: 'Todo not found.' });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Could not delete todo.' });
  }
});

// ─── Lists Routes ─────────────────────────────────────────────────────────────

// GET /api/lists — list all custom lists for authenticated user
app.get('/api/lists', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, group_id, created_at FROM lists WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.sub],
    );
    return res.json({ lists: result.rows });
  } catch {
    return res.status(500).json({ message: 'Could not fetch lists.' });
  }
});

// POST /api/lists — create a new list
app.post('/api/lists', requireAuth, async (req, res) => {
  const name = req.body.name?.trim();
  const group_id = req.body.group_id || null;
  if (!name)
    return res.status(400).json({ message: 'List name is required.' });

  try {
    const result = await pool.query(
      'INSERT INTO lists (user_id, name, group_id) VALUES ($1, $2, $3) RETURNING id, name, group_id, created_at',
      [req.user.sub, name, group_id],
    );
    return res.status(201).json({ list: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not create list.' });
  }
});

// PATCH /api/lists/:id — rename or update list
app.patch('/api/lists/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { name, group_id } = req.body;
  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (group_id !== undefined) {
      fields.push(`group_id = $${idx++}`);
      values.push(group_id);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    values.push(id, req.user.sub);
    const query = `
      UPDATE lists
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND user_id = $${idx++}
      RETURNING id, name, group_id, created_at
    `;
    const result = await pool.query(query, values);
    if (!result.rowCount)
      return res.status(404).json({ message: 'List not found.' });
    return res.json({ list: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not update list.' });
  }
});

// DELETE /api/lists/:id — delete a list
app.delete('/api/lists/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      'DELETE FROM lists WHERE id = $1 AND user_id = $2',
      [id, req.user.sub],
    );
    if (!result.rowCount)
      return res.status(404).json({ message: 'List not found.' });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Could not delete list.' });
  }
});

// ─── List Groups Routes ───────────────────────────────────────────────────────

// GET /api/groups — list all list groups
app.get('/api/groups', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM list_groups WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.sub],
    );
    return res.json({ groups: result.rows });
  } catch {
    return res.status(500).json({ message: 'Could not fetch list groups.' });
  }
});

// POST /api/groups — create a list group
app.post('/api/groups', requireAuth, async (req, res) => {
  const name = req.body.name?.trim();
  if (!name)
    return res.status(400).json({ message: 'Group name is required.' });

  try {
    const result = await pool.query(
      'INSERT INTO list_groups (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at',
      [req.user.sub, name],
    );
    return res.status(201).json({ group: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not create list group.' });
  }
});

// PATCH /api/groups/:id — rename group
app.patch('/api/groups/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const name = req.body.name?.trim();
  if (!name)
    return res.status(400).json({ message: 'Group name is required.' });

  try {
    const result = await pool.query(
      'UPDATE list_groups SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, created_at',
      [name, id, req.user.sub],
    );
    if (!result.rowCount)
      return res.status(404).json({ message: 'Group not found.' });
    return res.json({ group: result.rows[0] });
  } catch {
    return res.status(500).json({ message: 'Could not update list group.' });
  }
});

// DELETE /api/groups/:id — delete group
app.delete('/api/groups/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      'DELETE FROM list_groups WHERE id = $1 AND user_id = $2',
      [id, req.user.sub],
    );
    if (!result.rowCount)
      return res.status(404).json({ message: 'Group not found.' });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Could not delete list group.' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await ensureSchema();
    await pool.query('SELECT NOW()');
    app.listen(port, () =>
      console.log(`✅ Todo API listening on http://localhost:${port}`),
    );
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

start();
