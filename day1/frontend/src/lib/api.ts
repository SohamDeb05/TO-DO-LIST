const BASE = 'http://localhost:4000';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-session');
    if (!raw) return null;
    const session = JSON.parse(raw) as { token?: string };
    return session.token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return request<{ token: string; user: User }>('POST', '/api/auth/login', {
    email,
    password,
  });
}

export async function signup(name: string, email: string, password: string) {
  return request<{ token: string; user: User }>('POST', '/api/auth/signup', {
    name,
    email,
    password,
  });
}

export async function getMe() {
  return request<{ user: User }>('GET', '/api/auth/me');
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export async function getTodos() {
  return request<{ todos: Todo[] }>('GET', '/api/todos');
}

export async function createTodo(title: string) {
  return request<{ todo: Todo }>('POST', '/api/todos', { title });
}

export async function updateTodo(
  id: number,
  patch: { title?: string; completed?: boolean },
) {
  return request<{ todo: Todo }>('PATCH', `/api/todos/${id}`, patch);
}

export async function toggleTodo(id: number) {
  return request<{ todo: Todo }>('PATCH', `/api/todos/${id}/toggle`);
}

export async function deleteTodo(id: number) {
  return request<void>('DELETE', `/api/todos/${id}`);
}
