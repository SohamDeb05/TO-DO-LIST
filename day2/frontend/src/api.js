const BASE = 'http://localhost:4001/api';

export const DEFAULT_SETTINGS = {
  confirmBeforeDeleting: true,
  addNewTasksOnTop: true,
  moveStarredToTop: true,
  playCompletionSound: true,
  showRightClickMenus: true,
  reminderNotifications: true,
  darkMode: false,
  smartListImportant: true,
  smartListPlanned: true,
  smartListAll: false,
  smartListCompleted: false,
  autoHideEmptySmartLists: false,
  showDueTodayInMyDay: true,
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveSession(token, user) {
  localStorage.setItem('todo-session', JSON.stringify({ token, user }));
}

export function clearSession() {
  localStorage.removeItem('todo-session');
}

export function loadSession() {
  try {
    const raw = localStorage.getItem('todo-session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getToken() {
  const session = loadSession();
  return session?.token ?? '';
}

// ─── Request helper ───────────────────────────────────────────────────────────

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data;
}

export async function saveAppSettings(settings) {
  return request('PUT', '/settings', settings);
}

export async function fetchAppSettings() {
  try {
    const data = await request('GET', '/settings');
    if (data && data.settings && Object.keys(data.settings).length > 0) {
      return { ...DEFAULT_SETTINGS, ...data.settings };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

// ─── API helper ─────────────────────────────────────────────────────────────────────

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  return request('POST', '/auth/login', { email, password });
}

export async function signup(name, email, password) {
  return request('POST', '/auth/signup', { name, email, password });
}

export async function updateProfile(name, profilePicture) {
  return request('PUT', '/auth/profile', { name, profilePicture });
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export async function getTodos() {
  return request('GET', '/todos');
}

export async function createTodo(title, important, due_date, list_id, note, reminder, repeat_schedule) {
  return request('POST', '/todos', { title, important, due_date, list_id, note, reminder, repeat_schedule });
}

export async function updateTodo(id, patch) {
  return request('PATCH', `/todos/${id}`, patch);
}

export async function toggleTodo(id) {
  return request('PATCH', `/todos/${id}/toggle`);
}

export async function deleteTodo(id) {
  return request('DELETE', `/todos/${id}`);
}

// ─── Lists ────────────────────────────────────────────────────────────────────

export async function getLists() {
  return request('GET', '/lists');
}

export async function createList(name, group_id) {
  return request('POST', '/lists', { name, group_id });
}

export async function updateList(id, patch) {
  return request('PATCH', `/lists/${id}`, patch);
}

export async function deleteList(id) {
  return request('DELETE', `/lists/${id}`);
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function getGroups() {
  return request('GET', '/groups');
}

export async function createGroup(name) {
  return request('POST', '/groups', { name });
}

export async function updateGroup(id, name) {
  return request('PATCH', `/groups/${id}`, { name });
}

export async function deleteGroup(id) {
  return request('DELETE', `/groups/${id}`);
}
