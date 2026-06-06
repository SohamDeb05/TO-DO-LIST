import { useEffect, useRef, useState } from "react";
import {
  createTodo,
  deleteTodo,
  getTodos,
  toggleTodo,
  updateTodo,
  type Todo,
  type User,
} from "@/lib/api";

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-5 h-5 flex-shrink-0 transition-all duration-200"
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        stroke={checked ? "transparent" : "rgba(255,255,255,0.25)"}
        strokeWidth="1.5"
        fill={
          checked
            ? "url(#check-grad)"
            : "transparent"
        }
      />
      {checked && (
        <path
          d="M6 10.5l3 3 5-6"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <defs>
        <linearGradient id="check-grad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path
        d="M13.586 3.586a2 2 0 112.828 2.828L7 14.828 4 16l1.172-3L13.586 3.586z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path
        d="M5 5l1 11h8L15 5M3 5h14M8 5V3h4v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path
        d="M5 10.5l4 4 6-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── TodoItem ─────────────────────────────────────────────────────────────────

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string) => void;
}

function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, trimmed);
    } else {
      setDraft(todo.title);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setDraft(todo.title);
      setEditing(false);
    }
  }

  return (
    <div
      className={`todo-item group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
        todo.completed
          ? "border-white/5 bg-white/3 opacity-60"
          : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
      }`}
      style={{ animation: "slideIn 0.25s ease-out" }}
    >
      <button
        id={`todo-toggle-${todo.id}`}
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 hover:scale-110 transition-transform duration-150"
        title="Toggle complete"
      >
        <CheckIcon checked={todo.completed} />
      </button>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 bg-transparent border-b border-indigo-400/60 text-white text-sm outline-none py-0.5 focus:border-indigo-400"
        />
      ) : (
        <span
          className={`flex-1 text-sm leading-relaxed cursor-default select-none ${
            todo.completed
              ? "line-through text-white/35"
              : "text-white/80"
          }`}
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
        >
          {todo.title}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {editing ? (
          <button
            id={`todo-save-${todo.id}`}
            onClick={handleSave}
            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
            title="Save"
          >
            <SaveIcon />
          </button>
        ) : (
          <button
            id={`todo-edit-${todo.id}`}
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-indigo-300 hover:bg-indigo-400/10 transition-colors"
            title="Edit"
          >
            <PencilIcon />
          </button>
        )}
        <button
          id={`todo-delete-${todo.id}`}
          onClick={() => onDelete(todo.id)}
          className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  const messages: Record<string, { icon: string; text: string }> = {
    all: { icon: "✨", text: "Your list is clear. Add something to do!" },
    active: { icon: "🎉", text: "No active tasks — you're all caught up!" },
    completed: { icon: "📋", text: "Nothing completed yet. Get started!" },
  };
  const { icon, text } = messages[filter] ?? messages.all;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/30">
      <span className="text-5xl mb-3 opacity-60">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ─── TodoPage ─────────────────────────────────────────────────────────────────

type Filter = "all" | "active" | "completed";

interface TodoPageProps {
  user: User;
  onLogout: () => void;
}

export default function TodoPage({ user, onLogout }: TodoPageProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // Fetch todos on mount
  useEffect(() => {
    getTodos()
      .then(({ todos }) => setTodos(todos))
      .catch(() => setError("Failed to load tasks."))
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const visible = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  async function handleAdd() {
    const title = input.trim();
    if (!title) return;
    setAdding(true);
    try {
      const { todo } = await createTodo(title);
      setTodos((prev) => [...prev, todo]);
      setInput("");
    } catch {
      setError("Could not add task.");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: number) {
    try {
      const { todo } = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
    } catch {
      setError("Could not update task.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Could not delete task.");
    }
  }

  async function handleUpdate(id: number, title: string) {
    try {
      const { todo } = await updateTodo(id, { title });
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
    } catch {
      setError("Could not update task.");
    }
  }

  async function handleClearCompleted() {
    const completed = todos.filter((t) => t.completed);
    await Promise.all(completed.map((t) => deleteTodo(t.id)));
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const FILTERS: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .todo-page { animation: fadeIn 0.4s ease-out; }
        .bg-white\\/3 { background-color: rgba(255,255,255,0.03); }
        .bg-white\\/8 { background-color: rgba(255,255,255,0.08); }
      `}</style>

      <div className="todo-page min-h-screen flex flex-col items-center px-4 py-12">
        {/* Header */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                My Tasks
              </h1>
              <p className="text-sm text-white/40 mt-0.5">
                Welcome back,{" "}
                <span className="text-indigo-300 font-medium">{user.name}</span>
              </p>
            </div>
            <button
              id="logout-btn"
              onClick={onLogout}
              className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-lg rounded-2xl border border-white/10 p-6 flex flex-col gap-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* Input row */}
          <div className="flex gap-2">
            <input
              id="todo-input"
              type="text"
              placeholder="Add a new task…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all duration-200"
            />
            <button
              id="todo-add-btn"
              onClick={handleAdd}
              disabled={adding || !input.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                boxShadow: adding ? "none" : "0 4px 15px rgba(99,102,241,0.35)",
              }}
            >
              <PlusIcon />
              Add
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-rose-400 text-center -mt-2">{error}</p>
          )}

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-white/3 rounded-xl p-1">
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                id={`filter-${value}`}
                onClick={() => setFilter(value)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-all duration-200 ${
                  filter === value
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-white/30 px-1">
            <span>
              {activeCount} task{activeCount !== 1 ? "s" : ""} remaining
            </span>
            {todos.some((t) => t.completed) && (
              <button
                id="clear-completed-btn"
                onClick={handleClearCompleted}
                className="hover:text-rose-400 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 -mx-2" />

          {/* Task list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"
              />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-white/20">
          Double-click any task to edit it
        </p>
      </div>
    </>
  );
}
