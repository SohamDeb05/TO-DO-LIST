const BASE = 'http://localhost:4001/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  important?: boolean;
  due_date?: string | null;
  list_id?: number | null;
  note?: string | null;
  reminder?: string | null;
  repeat_schedule?: string | null;
  created_at: string;
}

export interface List {
  id: number;
  name: string;
  group_id?: number | null;
  created_at: string;
}

export interface ListGroup {
  id: number;
  name: string;
  created_at: string;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveSession(token: string, user: User) {
  localStorage.setItem('todo-session', JSON.stringify({ token, user }));
}

export function clearSession() {
  localStorage.removeItem('todo-session');
}

export function loadSession(): { token: string; user: User } | null {
  try {
    const raw = localStorage.getItem('todo-session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getToken(): string {
  const session = loadSession();
  return session?.token ?? '';
}

// ─── Request helper ───────────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return request<{ token: string; user: User }>('POST', '/auth/login', { email, password });
}

export async function signup(name: string, email: string, password: string) {
  return request<{ token: string; user: User }>('POST', '/auth/signup', { name, email, password });
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export async function getTodos() {
  return request<{ todos: Todo[] }>('GET', '/todos');
}

export async function createTodo(title: string, important?: boolean, due_date?: string | null, list_id?: number | null, note?: string | null, reminder?: string | null, repeat_schedule?: string | null) {
  return request<{ todo: Todo }>('POST', '/todos', { title, important, due_date, list_id, note, reminder, repeat_schedule });
}

export async function updateTodo(id: number, patch: { title?: string; completed?: boolean; important?: boolean; due_date?: string | null; list_id?: number | null; note?: string | null; reminder?: string | null; repeat_schedule?: string | null }) {
  return request<{ todo: Todo }>('PATCH', `/todos/${id}`, patch);
}

export async function toggleTodo(id: number) {
  return request<{ todo: Todo }>('PATCH', `/todos/${id}/toggle`);
}

export async function deleteTodo(id: number) {
  return request<void>('DELETE', `/todos/${id}`);
}

// ─── Lists ────────────────────────────────────────────────────────────────────

export async function getLists() {
  return request<{ lists: List[] }>('GET', '/lists');
}

export async function createList(name: string, group_id?: number | null) {
  return request<{ list: List }>('POST', '/lists', { name, group_id });
}

export async function updateList(id: number, patch: { name?: string; group_id?: number | null }) {
  return request<{ list: List }>('PATCH', `/lists/${id}`, patch);
}

export async function deleteList(id: number) {
  return request<void>('DELETE', `/lists/${id}`);
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function getGroups() {
  return request<{ groups: ListGroup[] }>('GET', '/groups');
}

export async function createGroup(name: string) {
  return request<{ group: ListGroup }>('POST', '/groups', { name });
}

export async function updateGroup(id: number, name: string) {
  return request<{ group: ListGroup }>('PATCH', `/groups/${id}`, { name });
}

export async function deleteGroup(id: number) {
  return request<void>('DELETE', `/groups/${id}`);
}
