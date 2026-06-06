import { useEffect, useRef, useState } from 'react';
import {
  createTodo, deleteTodo, getTodos, toggleTodo, updateTodo,
  getLists, getGroups, createList, updateList, deleteList,
  createGroup, updateGroup, deleteGroup,
  type Todo, type User, type List, type ListGroup,
} from '../api';
import WelcomeModal from './WelcomeModal';
import {
  Menu, Search, Settings, HelpCircle, Bell,
  Sun, Star, CalendarDays, CircleUser, Home, Plus,
  MoreHorizontal, LayoutGrid, List as ListIcon, ArrowUpDown, Layers,
  NotebookPen, BellRing, RefreshCw,
  Pencil, Check, Trash2,
  ClipboardList, ChevronDown, ChevronRight,
  Folder, FolderPlus,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const S = 15;
const SM = 14;

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Task item ────────────────────────────────────────────────────────────────

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string) => void;
  onToggleImportant: (id: number) => void;
  onUpdateDueDate: (id: number, dueDate: string | null) => void;
}

function TaskItem({ todo, onToggle, onDelete, onUpdate, onToggleImportant, onUpdateDueDate }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  function save() {
    const t = draft.trim();
    if (t && t !== todo.title) onUpdate(todo.id, t);
    else setDraft(todo.title);
    setEditing(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') { setDraft(todo.title); setEditing(false); }
  }

  const isOverdue = todo.due_date && !todo.completed && new Date(todo.due_date + 'T23:59:59') < new Date();

  return (
    <div className={`ms-task-item${editing ? ' editing' : ''}${todo.completed ? ' completed' : ''}`}>
      <button
        id={`toggle-${todo.id}`}
        className={`ms-check${todo.completed ? ' checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        title="Toggle complete"
      >
        <Check size={10} strokeWidth={2.5} color="white" />
      </button>

      <div className="ms-task-content">
        {editing ? (
          <input
            ref={inputRef}
            className="ms-edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            onBlur={save}
          />
        ) : (
          <div className="ms-title-due-container">
            <span
              className={`ms-task-title${todo.completed ? ' done' : ''}`}
              onDoubleClick={() => !todo.completed && setEditing(true)}
              title={todo.completed ? '' : 'Double-click to edit'}
            >
              {todo.title}
            </span>
            {todo.due_date && (
              <div className={`ms-task-due${isOverdue ? ' overdue' : ''}`}>
                <CalendarDays size={11} />
                <span>Due {new Date(todo.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ms-item-actions-row">
        {/* Date picker inline trigger */}
        <div className="ms-date-picker-wrap" ref={popoverRef}>
          <button
            className="ms-action-btn"
            onClick={() => setShowDatePicker(!showDatePicker)}
            title="Set due date"
          >
            <CalendarDays size={SM} />
          </button>
          {showDatePicker && (
            <div className="ms-date-popover">
              <input
                type="date"
                value={todo.due_date ? todo.due_date.substring(0, 10) : ''}
                onChange={(e) => {
                  onUpdateDueDate(todo.id, e.target.value || null);
                  setShowDatePicker(false);
                }}
              />
              <button onClick={() => { onUpdateDueDate(todo.id, null); setShowDatePicker(false); }} className="ms-clear-date-btn">
                Clear
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <button id={`save-${todo.id}`} className="ms-action-btn save" onClick={save} title="Save">
            <Check size={SM} />
          </button>
        ) : (
          !todo.completed && (
            <button id={`edit-${todo.id}`} className="ms-action-btn" onClick={() => setEditing(true)} title="Edit">
              <Pencil size={SM} />
            </button>
          )
        )}

        <button id={`delete-${todo.id}`} className="ms-action-btn delete" onClick={() => onDelete(todo.id)} title="Delete">
          <Trash2 size={SM} />
        </button>

        {/* Star for toggle important */}
        <button
          className={`ms-star-btn${todo.important ? ' starred' : ''}`}
          onClick={() => onToggleImportant(todo.id)}
          title={todo.important ? 'Mark as not important' : 'Mark as important'}
        >
          <Star size={16} fill={todo.important ? '#ffb900' : 'none'} />
        </button>
      </div>
    </div>
  );
}

// ─── Nav definition ───────────────────────────────────────────────────────────

const NAV = [
  { icon: <Sun size={S} />, label: 'My Day', id: 'myday' },
  { icon: <Star size={S} />, label: 'Important', id: 'important' },
  { icon: <CalendarDays size={S} />, label: 'Planned', id: 'planned' },
  { icon: <CircleUser size={S} />, label: 'Assigned to me', id: 'assigned' },
  { icon: <Home size={S} />, label: 'Tasks', id: 'tasks' },
];

// ─── TodoPage ─────────────────────────────────────────────────────────────────

interface TodoPageProps {
  user: User;
  onLogout: () => void;
}

type Filter = 'all' | 'active' | 'completed';
type SortKey = 'default' | 'title' | 'dueDate' | 'importance' | 'creationDate';

export default function TodoPage({ user, onLogout }: TodoPageProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('myday');

  // Custom lists & groups states
  const [lists, setLists] = useState<List[]>([]);
  const [groups, setGroups] = useState<ListGroup[]>([]);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [listDraft, setListDraft] = useState('');
  const [groupDraft, setGroupDraft] = useState('');

  // UI states
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Grouping states
  const [groupBy, setGroupBy] = useState<'none' | 'completed' | 'importance' | 'dueDate'>('none');
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  // Welcome modal — once per user
  const welcomeKey = `taskflow-welcomed-${user.id}`;
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem(welcomeKey));
  function dismissWelcome() { localStorage.setItem(welcomeKey, '1'); setShowWelcome(false); }

  // Load todos, lists, and groups
  useEffect(() => {
    Promise.all([getTodos(), getLists(), getGroups()])
      .then(([{ todos }, { lists }, { groups }]) => {
        setTodos(todos);
        setLists(lists);
        setGroups(groups);
      })
      .catch(() => setError('Failed to load tasks and lists.'))
      .finally(() => setLoading(false));
  }, []);

  // Handle outside clicks for Sort Menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortMenu]);

  // Handle outside clicks for Group Menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) {
        setShowGroupMenu(false);
      }
    }
    if (showGroupMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGroupMenu]);

  // Derived filter & sorting
  const getFilteredAndSortedTodos = (): Todo[] => {
    let result = [...todos];

    // 1. Navigation View filter
    if (activeNav === 'important') {
      result = result.filter(t => t.important);
    } else if (activeNav === 'planned') {
      result = result.filter(t => t.due_date);
    } else if (activeNav === 'assigned') {
      result = []; // always empty for personalized view
    } else if (activeNav === 'tasks') {
      result = result.filter(t => t.list_id === null);
    } else if (activeNav.startsWith('list-')) {
      const listId = Number(activeNav.substring(5));
      result = result.filter(t => t.list_id === listId);
    }

    // 2. Sorting
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'dueDate') {
      result.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else if (sortBy === 'importance') {
      result.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
    } else if (sortBy === 'creationDate') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return result;
  };

  const filteredTodos = getFilteredAndSortedTodos();
  const activeTodos = filteredTodos.filter(t => !t.completed);
  const completedTodos = filteredTodos.filter(t => t.completed);

  const completedCount = todos.filter(t => t.completed).length;
  const pct = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  // Handlers
  async function handleAdd() {
    const title = input.trim();
    if (!title) return;
    setAdding(true);
    try {
      const isImportant = activeNav === 'important';
      const dueDate = activeNav === 'planned' ? new Date().toISOString().split('T')[0] : null;
      const listId = activeNav.startsWith('list-') ? Number(activeNav.substring(5)) : null;

      const { todo } = await createTodo(title, isImportant, dueDate, listId);
      setTodos(prev => [...prev, todo]);
      setInput('');
    } catch {
      setError('Could not add task.');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: number) {
    try {
      const { todo } = await toggleTodo(id);
      setTodos(prev => prev.map(t => t.id === id ? todo : t));
    } catch { setError('Could not update task.'); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch { setError('Could not delete task.'); }
  }

  async function handleUpdate(id: number, title: string) {
    try {
      const { todo } = await updateTodo(id, { title });
      setTodos(prev => prev.map(t => t.id === id ? todo : t));
    } catch { setError('Could not update task.'); }
  }

  async function handleToggleImportant(id: number) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const { todo: updated } = await updateTodo(id, { important: !todo.important });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch { setError('Could not update task.'); }
  }

  async function handleUpdateDueDate(id: number, due_date: string | null) {
    try {
      const { todo: updated } = await updateTodo(id, { due_date });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch { setError('Could not update task.'); }
  }

  async function clearCompleted() {
    const done = todos.filter(t => t.completed);
    await Promise.all(done.map(t => deleteTodo(t.id)));
    setTodos(prev => prev.filter(t => !t.completed));
  }

  // Custom Lists & Groups Handlers
  async function handleCreateNewList() {
    try {
      const { list } = await createList('Untitled list');
      setLists(prev => [...prev, list]);
      setActiveNav(`list-${list.id}`);
      setEditingListId(list.id);
      setListDraft('Untitled list');
    } catch {
      setError('Could not create list.');
    }
  }

  async function handleCreateNewGroup() {
    try {
      const { group } = await createGroup('Untitled group');
      setGroups(prev => [...prev, group]);
      setEditingGroupId(group.id);
      setGroupDraft('Untitled group');
    } catch {
      setError('Could not create group.');
    }
  }

  async function handleSaveListRename(id: number) {
    const name = listDraft.trim();
    if (!name) return setEditingListId(null);
    try {
      const { list } = await updateList(id, { name });
      setLists(prev => prev.map(l => l.id === id ? list : l));
    } catch {
      setError('Could not rename list.');
    } finally {
      setEditingListId(null);
    }
  }

  async function handleSaveGroupRename(id: number) {
    const name = groupDraft.trim();
    if (!name) return setEditingGroupId(null);
    try {
      const { group } = await updateGroup(id, name);
      setGroups(prev => prev.map(g => g.id === id ? group : g));
    } catch {
      setError('Could not rename group.');
    } finally {
      setEditingGroupId(null);
    }
  }

  async function handleMoveListToGroup(listId: number, groupId: number | null) {
    try {
      const { list } = await updateList(listId, { group_id: groupId });
      setLists(prev => prev.map(l => l.id === listId ? list : l));
    } catch {
      setError('Could not move list.');
    }
  }

  async function handleDeleteList(id: number) {
    try {
      await deleteList(id);
      setLists(prev => prev.filter(l => l.id !== id));
      setTodos(prev => prev.filter(t => t.list_id !== id));
      if (activeNav === `list-${id}`) {
        setActiveNav('tasks');
      }
    } catch {
      setError('Could not delete list.');
    }
  }

  async function handleDeleteGroup(id: number) {
    try {
      await deleteGroup(id);
      setGroups(prev => prev.filter(g => g.id !== id));
      setLists(prev => prev.map(l => l.group_id === id ? { ...l, group_id: null } : l));
    } catch {
      setError('Could not delete group.');
    }
  }

  // Get active nav info
  const getActiveViewMeta = () => {
    if (activeNav.startsWith('list-')) {
      const listId = Number(activeNav.substring(5));
      const list = lists.find(l => l.id === listId);
      return {
        title: list ? list.name : 'Untitled list',
        icon: <ListIcon size={22} />,
        color: 'var(--ms-blue)',
        emptyText: 'This list is empty.',
      };
    }

    return ({
      myday: {
        title: 'My Day',
        icon: <Sun size={22} />,
        color: 'var(--ms-blue)',
        emptyText: 'Focus on your day here.',
      },
      important: {
        title: 'Important',
        icon: <Star size={22} />,
        color: '#d13438', // Dark Pink/Red
        emptyText: 'Try adding a task to Important.',
      },
      planned: {
        title: 'Planned',
        icon: <CalendarDays size={22} />,
        color: '#0078d4',
        emptyText: 'Tasks with due dates show up here.',
      },
      assigned: {
        title: 'Assigned to me',
        icon: <CircleUser size={22} />,
        color: 'var(--ms-success)',
        emptyText: 'Tasks assigned to you show up here.',
      },
      tasks: {
        title: 'Tasks',
        icon: <Home size={22} />,
        color: 'var(--ms-blue)',
        emptyText: 'Add a task to get started.',
      },
    }[activeNav as 'myday' | 'important' | 'planned' | 'assigned' | 'tasks'] || {
      title: 'Tasks',
      icon: <Home size={22} />,
      color: 'var(--ms-blue)',
      emptyText: 'Add a task to get started.',
    });
  };

  const viewMeta = getActiveViewMeta();

  // Planned & grouping helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(new Date().getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const effectiveGroupBy = groupBy !== 'none' ? groupBy : (activeNav === 'planned' && sortBy === 'default' ? 'dueDate' : 'none');

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderGroupSection = (groupKey: string, title: string, tasks: Todo[], sectionColor?: string) => {
    if (tasks.length === 0) return null;
    const isExpanded = !collapsedGroups[groupKey];
    return (
      <div key={groupKey} className="ms-group-section">
        <div
          className={`ms-planned-section-title${!isExpanded ? ' collapsed' : ''}`}
          style={{ color: sectionColor, cursor: 'pointer', userSelect: 'none' }}
          onClick={() => toggleGroupCollapse(groupKey)}
        >
          <ChevronDown
            size={12}
            style={{
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
              marginRight: 4,
            }}
          />
          <span>{title} • {tasks.length}</span>
        </div>
        {isExpanded && (
          <div className={`ms-task-list ${viewMode === 'grid' ? 'grid-layout' : ''}`}>
            {tasks.map(todo => (
              <TaskItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onToggleImportant={handleToggleImportant}
                onUpdateDueDate={handleUpdateDueDate}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  function renderListRow(list: List) {
    const isEditing = editingListId === list.id;
    const isActive = activeNav === `list-${list.id}`;
    const listTodos = todos.filter(t => t.list_id === list.id);
    const activeCount = listTodos.filter(t => !t.completed).length;

    return (
      <div
        key={list.id}
        className={`nav-item nav-custom-list${isActive ? ' active' : ''}`}
        onClick={() => setActiveNav(`list-${list.id}`)}
      >
        <ListIcon size={S} className="nav-icon" style={{ color: isActive ? viewMeta.color : undefined }} />
        {isEditing ? (
          <input
            className="list-edit-input"
            value={listDraft}
            onChange={e => setListDraft(e.target.value)}
            onBlur={() => handleSaveListRename(list.id)}
            onKeyDown={e => e.key === 'Enter' && handleSaveListRename(list.id)}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className="list-title-text"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingListId(list.id);
              setListDraft(list.name);
            }}
          >
            {list.name}
          </span>
        )}

        {activeCount > 0 && <span className="list-badge">{activeCount}</span>}

        {!isEditing && (
          <div className="list-row-actions">
            {groups.length > 0 && (
              <select
                className="list-move-select"
                value={list.group_id || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handleMoveListToGroup(list.id, e.target.value ? Number(e.target.value) : null);
                }}
                onClick={e => e.stopPropagation()}
                title="Move to group"
              >
                <option value="">No Group</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteList(list.id);
              }}
              title="Delete list"
              className="list-delete-btn"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {showWelcome && <WelcomeModal userName={user.name} onClose={dismissWelcome} />}

      <div className="app-wrapper">

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="top-bar">
          <button
            id="sidebar-toggle"
            className="top-bar-btn-icon"
            title="Collapse/Expand menus"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu size={S} />
          </button>
          <span className="top-bar-logo">To Do</span>

          <div className="top-bar-search-wrap">
            <span className="top-bar-search-icon"><Search size={14} /></span>
            <input className="top-bar-search" type="search" placeholder="Search" />
          </div>

          <div className="top-bar-right">
            <button className="top-bar-btn-icon" title="Settings"><Settings size={S} /></button>
            <button className="top-bar-btn-icon" title="Help"><HelpCircle size={S} /></button>
            <button className="top-bar-btn-icon" title="Notifications"><Bell size={S} /></button>
            <div
              className="top-bar-avatar"
              title={`${user.name} — click to log out`}
              onClick={onLogout}
            >
              {initials(user.name)}
            </div>
          </div>
        </div>

        {/* ── App body ────────────────────────────────────────────────────── */}
        <div className="app-body">

          {/* Sidebar */}
          <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
            <nav className="nav-list">
              {/* Static top navigation */}
              {NAV.map(({ icon, label, id }) => (
                <button
                  key={id}
                  id={`nav-${id}`}
                  className={`nav-item${activeNav === id ? ` active${id === 'assigned' ? ' assigned-active' : ''}` : ''}`}
                  onClick={() => setActiveNav(id)}
                >
                  <span className="nav-icon" style={{ color: activeNav === id ? viewMeta.color : undefined }}>{icon}</span>
                  {label}
                </button>
              ))}

              <div className="sidebar-divider" />

              {/* Scrollable area for custom lists and groups */}
              <div className="nav-scrollable-area">
                {/* List Groups */}
                {groups.map(group => {
                  const isEditing = editingGroupId === group.id;
                  const groupLists = lists.filter(l => l.group_id === group.id);

                  return (
                    <div key={group.id} className="sidebar-group-container">
                      <div className="sidebar-group-header">
                        <Folder size={14} className="group-icon" />
                        {isEditing ? (
                          <input
                            className="group-edit-input"
                            value={groupDraft}
                            onChange={e => setGroupDraft(e.target.value)}
                            onBlur={() => handleSaveGroupRename(group.id)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveGroupRename(group.id)}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="group-title"
                            onDoubleClick={() => {
                              setEditingGroupId(group.id);
                              setGroupDraft(group.name);
                            }}
                          >
                            {group.name}
                          </span>
                        )}

                        {!isEditing && (
                          <div className="group-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group.id);
                              }}
                              title="Delete group"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="group-lists-container">
                        {groupLists.map(list => renderListRow(list))}
                      </div>
                    </div>
                  );
                })}

                {/* Ungrouped custom lists */}
                {lists.filter(l => !l.group_id).map(list => renderListRow(list))}
              </div>

              {/* Custom New List / Group creation bottom-bar row */}
              <div className="nav-new-list-row">
                <button className="nav-new-list-btn" onClick={handleCreateNewList}>
                  <Plus size={S} />
                  <span>New list</span>
                </button>
                <button className="nav-new-group-btn" onClick={handleCreateNewGroup} title="Create group">
                  <FolderPlus size={S} />
                </button>
              </div>
            </nav>
          </aside>

          {/* ── Main area ───────────────────────────────────────────────── */}
          <main className="main-area">

            {/* Header */}
            <div className="content-header">
              <div className="content-title-row">
                <div className="content-title" style={{ color: viewMeta.color }}>
                  {viewMeta.icon}
                  {viewMeta.title}
                  <button className="content-title-dots" title="More options">
                    <MoreHorizontal size={S} />
                  </button>
                </div>
                <div className="content-view-toggle">
                  <button
                    className={`btn-view${viewMode === 'grid' ? ' active' : ''}`}
                    style={{ color: viewMode === 'grid' ? viewMeta.color : undefined, background: viewMode === 'grid' ? `${viewMeta.color}15` : undefined }}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <LayoutGrid size={SM} /> Grid
                  </button>
                  <button
                    className={`btn-view${viewMode === 'list' ? ' active' : ''}`}
                    style={{ color: viewMode === 'list' ? viewMeta.color : undefined, background: viewMode === 'list' ? `${viewMeta.color}15` : undefined }}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <ListIcon size={SM} /> List
                  </button>
                </div>
              </div>
              {activeNav === 'myday' && <div className="content-date" style={{ color: viewMeta.color }}>{formatDate()}</div>}
              {activeNav === 'important' && <div className="content-date" style={{ color: viewMeta.color }}>Sorted by importance</div>}
            </div>

            {/* Toolbar */}
            <div className="content-toolbar">
              {/* Sort button with custom dropdown */}
              {activeNav !== 'assigned' && (
                <div className="ms-menu-container" ref={sortMenuRef}>
                  <button className="btn-toolbar" onClick={() => setShowSortMenu(!showSortMenu)}>
                    <ArrowUpDown size={SM} />
                    Sort{sortBy !== 'default' ? ': ' + sortBy : ''}
                  </button>
                  {showSortMenu && (
                    <div className="ms-dropdown-menu">
                      <button className={`ms-dropdown-item${sortBy === 'importance' ? ' active' : ''}`} onClick={() => { setSortBy('importance'); setShowSortMenu(false); }}>
                        <Star size={12} style={{ marginRight: 6 }} /> Importance
                      </button>
                      <button className={`ms-dropdown-item${sortBy === 'dueDate' ? ' active' : ''}`} onClick={() => { setSortBy('dueDate'); setShowSortMenu(false); }}>
                        <CalendarDays size={12} style={{ marginRight: 6 }} /> Due date
                      </button>
                      <button className={`ms-dropdown-item${sortBy === 'title' ? ' active' : ''}`} onClick={() => { setSortBy('title'); setShowSortMenu(false); }}>
                        <ArrowUpDown size={12} style={{ marginRight: 6 }} /> Alphabetically
                      </button>
                      <button className={`ms-dropdown-item${sortBy === 'creationDate' ? ' active' : ''}`} onClick={() => { setSortBy('creationDate'); setShowSortMenu(false); }}>
                        <RefreshCw size={12} style={{ marginRight: 6 }} /> Creation date
                      </button>
                      <div className="sidebar-divider" />
                      <button className="ms-dropdown-item" onClick={() => { setSortBy('default'); setShowSortMenu(false); }}>
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="ms-menu-container" ref={groupMenuRef}>
                <button className="btn-toolbar" onClick={() => setShowGroupMenu(!showGroupMenu)}>
                  <Layers size={SM} />
                  Group{groupBy !== 'none' ? ': ' + (groupBy === 'dueDate' ? 'Due date' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)) : ''}
                </button>
                {showGroupMenu && (
                  <div className="ms-dropdown-menu">
                    <button className={`ms-dropdown-item${groupBy === 'completed' ? ' active' : ''}`} onClick={() => { setGroupBy('completed'); setShowGroupMenu(false); }}>
                      <Check size={12} style={{ marginRight: 6 }} /> Completed
                    </button>
                    <button className={`ms-dropdown-item${groupBy === 'importance' ? ' active' : ''}`} onClick={() => { setGroupBy('importance'); setShowGroupMenu(false); }}>
                      <Star size={12} style={{ marginRight: 6 }} /> Importance
                    </button>
                    <button className={`ms-dropdown-item${groupBy === 'dueDate' ? ' active' : ''}`} onClick={() => { setGroupBy('dueDate'); setShowGroupMenu(false); }}>
                      <CalendarDays size={12} style={{ marginRight: 6 }} /> Due date
                    </button>
                    <div className="sidebar-divider" />
                    <button className="ms-dropdown-item" onClick={() => { setGroupBy('none'); setShowGroupMenu(false); }}>
                      None
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Task area */}
            <div className="task-area">

              {error && (
                <div style={{ padding: '10px 24px' }}>
                  <div className="auth-error" style={{ borderRadius: 6, marginBottom: 0 }}>{error}</div>
                </div>
              )}

              {/* Progress bar */}
              {todos.length > 0 && (
                <div className="ms-progress-wrap">
                  <div className="ms-progress-header">
                    <span className="ms-progress-label">
                      {completedCount} of {todos.length} tasks completed
                    </span>
                    <span className="ms-progress-pct" style={{ color: viewMeta.color }}>
                      {pct === 100 ? '🎉 All done!' : `${pct}%`}
                    </span>
                  </div>
                  <div className="ms-progress-track">
                    <div
                      className={`ms-progress-fill${pct === 100 ? ' complete' : ''}`}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? undefined : viewMeta.color,
                      }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}

              {/* Add task */}
              {activeNav !== 'assigned' && (
                <div className="add-task-section">
                  <div className="add-task-row" onClick={() => inputRef.current?.focus()}>
                    <div className="add-task-circle" style={{ borderColor: viewMeta.color, color: viewMeta.color }}>
                      <Plus size={12} strokeWidth={2.5} />
                    </div>
                    <input
                      id="todo-input"
                      ref={inputRef}
                      className="add-task-input"
                      placeholder="Add a task"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                  </div>
                  <div className="add-task-subbar">
                    <button className="add-subbar-btn" title="Note"><NotebookPen size={SM} /></button>
                    <button className="add-subbar-btn" title="Reminder"><BellRing size={SM} /></button>
                    <button className="add-subbar-btn" title="Repeat"><RefreshCw size={SM} /></button>
                    <button
                      id="todo-add-btn"
                      className="btn-add"
                      style={{ backgroundColor: viewMeta.color }}
                      onClick={handleAdd}
                      disabled={adding || !input.trim()}
                    >
                      {adding ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

              {/* Task list / Empty view */}
              {loading ? (
                <div className="ms-loading"><div className="ms-loader" style={{ borderTopColor: viewMeta.color }} /></div>
              ) : activeNav === 'assigned' ? (
                /* Assigned to me custom empty state */
                <div className="ms-assigned-illustration animate-fade">
                  <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
                    <rect x="50" y="40" width="120" height="110" rx="12" fill="#e8f5e9" stroke="#81c784" strokeWidth="2.5" />
                    <rect x="65" y="60" width="90" height="8" rx="4" fill="#a5d6a7" />
                    <rect x="65" y="76" width="70" height="8" rx="4" fill="#a5d6a7" />
                    <circle cx="110" cy="118" r="14" fill="#388e3c" />
                    <path d="M92 148c0-11 8-20 18-20s18 9 18 20" fill="#388e3c" />
                  </svg>
                  <div className="ms-assigned-text">
                    <h3>{viewMeta.emptyText}</h3>
                    <p>Tasks assigned to you in To Do or Planner will appear in this list.</p>
                  </div>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="ms-empty">
                  <div className="ms-empty-icon" style={{ color: viewMeta.color }}>{viewMeta.icon}</div>
                  <span className="ms-empty-text">{viewMeta.emptyText}</span>
                </div>
              ) : (
                <div className="ms-task-lists-container">
                  {effectiveGroupBy === 'completed' && (
                    <>
                      {renderGroupSection('active', 'Active', activeTodos)}
                      {renderGroupSection('completed', 'Completed', completedTodos)}
                    </>
                  )}

                  {effectiveGroupBy === 'importance' && (
                    <>
                      {renderGroupSection('important', 'Important', activeTodos.filter(t => t.important))}
                      {renderGroupSection('tasks', 'Tasks', activeTodos.filter(t => !t.important))}
                    </>
                  )}

                  {effectiveGroupBy === 'dueDate' && (
                    <>
                      {renderGroupSection('overdue', 'Overdue', activeTodos.filter(t => t.due_date && t.due_date.substring(0, 10) < todayStr), 'var(--ms-danger)')}
                      {renderGroupSection('today', 'Today', activeTodos.filter(t => t.due_date && t.due_date.substring(0, 10) === todayStr), viewMeta.color)}
                      {renderGroupSection('tomorrow', 'Tomorrow', activeTodos.filter(t => t.due_date && t.due_date.substring(0, 10) === tomorrowStr))}
                      {renderGroupSection('later', 'Later', activeTodos.filter(t => t.due_date && t.due_date.substring(0, 10) > tomorrowStr))}
                      {renderGroupSection('noDueDate', 'No due date', activeTodos.filter(t => !t.due_date))}
                    </>
                  )}

                  {effectiveGroupBy === 'none' && (
                    /* Normal active list */
                    activeTodos.length > 0 && (
                      <div className={`ms-task-list ${viewMode === 'grid' ? 'grid-layout' : ''}`}>
                        {activeTodos.map(todo => (
                          <TaskItem
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onToggleImportant={handleToggleImportant}
                            onUpdateDueDate={handleUpdateDueDate}
                          />
                        ))}
                      </div>
                    )
                  )}

                  {/* Completed tasks collapsible section - ONLY shown when NOT grouped by completion */}
                  {effectiveGroupBy !== 'completed' && completedTodos.length > 0 && (
                    <div className="ms-completed-section">
                      <div
                        className={`ms-completed-toggle${!completedExpanded ? ' collapsed' : ''}`}
                        onClick={() => setCompletedExpanded(!completedExpanded)}
                      >
                        <ChevronDown size={14} />
                        <span>Completed • {completedTodos.length}</span>
                        <div className="ms-completed-line" />
                      </div>

                      {completedExpanded && (
                        <div className={`ms-task-list ${viewMode === 'grid' ? 'grid-layout' : ''}`}>
                          {completedTodos.map(todo => (
                            <TaskItem
                              key={todo.id}
                              todo={todo}
                              onToggle={handleToggle}
                              onDelete={handleDelete}
                              onUpdate={handleUpdate}
                              onToggleImportant={handleToggleImportant}
                              onUpdateDueDate={handleUpdateDueDate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {todos.some(t => t.completed) && (
                    <div style={{ padding: '16px 24px' }}>
                      <button
                        id="clear-completed-btn"
                        onClick={clearCompleted}
                        style={{ fontSize: 13, color: 'var(--ms-text-muted)', textDecoration: 'underline', textUnderlineOffset: 2 }}
                      >
                        Clear completed tasks
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
