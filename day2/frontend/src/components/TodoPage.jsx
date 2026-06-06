"use strict";
import { useEffect, useRef, useState } from "react";
import {
  createTodo,
  deleteTodo,
  getTodos,
  toggleTodo,
  updateTodo,
  getLists,
  getGroups,
  createList,
  updateList,
  deleteList,
  createGroup,
  updateGroup,
  deleteGroup,
  fetchAppSettings,
  saveAppSettings,
  DEFAULT_SETTINGS,
  updateProfile,
  saveSession,
  loadSession
} from "../api";
import WelcomeModal from "./WelcomeModal";
import ConfirmModal from "./ConfirmModal";
import {
  Menu,
  Search,
  Settings,
  Megaphone,
  X,
  Sun,
  Star,
  CalendarDays,
  CircleUser,
  Home,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Layers,
  NotebookPen,
  BellRing,
  RefreshCw,
  Pencil,
  Check,
  Trash2,
  ChevronDown,
  Folder,
  FolderPlus,
  Printer
} from "lucide-react";
function playCompletionAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playTone(880, now, 0.4);
    playTone(1108.73, now + 0.1, 0.6);
  } catch (e) {
  }
}
function playNotificationAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playTone(523.25, now, 0.3);
    playTone(659.25, now + 0.15, 0.4);
  } catch (e) {
  }
}
const S = 15;
const SM = 14;
function formatDate() {
  return (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}
function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function TaskItem({ todo, onToggle, onDelete, onUpdate, onToggleImportant, onUpdateDueDate, onUpdateNote, onUpdateReminder, onUpdateRepeat }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotePicker, setShowNotePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [noteDraft, setNoteDraft] = useState(todo.note || "");
  const [reminderDraft, setReminderDraft] = useState(todo.reminder ? todo.reminder.substring(0, 16) : "");
  const [repeatDraft, setRepeatDraft] = useState(todo.repeat_schedule || "daily");
  const inputRef = useRef(null);
  const popoverRef = useRef(null);
  const notePopoverRef = useRef(null);
  const reminderPopoverRef = useRef(null);
  const repeatPopoverRef = useRef(null);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setShowDatePicker(false);
      if (notePopoverRef.current && !notePopoverRef.current.contains(e.target)) setShowNotePicker(false);
      if (reminderPopoverRef.current && !reminderPopoverRef.current.contains(e.target)) setShowReminderPicker(false);
      if (repeatPopoverRef.current && !repeatPopoverRef.current.contains(e.target)) setShowRepeatPicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  function save() {
    const t = draft.trim();
    if (t && t !== todo.title) onUpdate(todo.id, t);
    else setDraft(todo.title);
    setEditing(false);
  }
  function onKey(e) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setDraft(todo.title);
      setEditing(false);
    }
  }
  const isOverdue = todo.due_date && !todo.completed && /* @__PURE__ */ new Date(todo.due_date + "T23:59:59") < /* @__PURE__ */ new Date();
  return <div className={`ms-task-item${editing ? " editing" : ""}${todo.completed ? " completed" : ""}`}><button
    id={`toggle-${todo.id}`}
    className={`ms-check${todo.completed ? " checked" : ""}`}
    onClick={() => onToggle(todo.id)}
    title="Toggle complete"
  ><Check size={10} strokeWidth={2.5} color="white" /></button><div className="ms-task-content">{editing ? <input
    ref={inputRef}
    className="ms-edit-input"
    value={draft}
    onChange={(e) => setDraft(e.target.value)}
    onKeyDown={onKey}
    onBlur={save}
  /> : <div className="ms-title-due-container"><span
    className={`ms-task-title${todo.completed ? " done" : ""}`}
    onDoubleClick={() => !todo.completed && setEditing(true)}
    title={todo.completed ? "" : "Double-click to edit"}
  >{todo.title}</span>{todo.due_date && <div className={`ms-task-due${isOverdue ? " overdue" : ""}`}><CalendarDays size={11} /><span>Due {new Date(todo.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</span></div>}{(todo.note || todo.reminder || todo.repeat_schedule) && <div className="ms-task-indicators">{todo.note && <div className="ms-indicator" onClick={() => setShowNotePicker(true)} title="View Note"><NotebookPen size={10} /></div>}{todo.reminder && <div className="ms-indicator" onClick={() => setShowReminderPicker(true)} title="View Reminder"><BellRing size={10} /> {new Date(todo.reminder).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>}{todo.repeat_schedule && <div className="ms-indicator" onClick={() => setShowRepeatPicker(true)} title="View Repeat"><RefreshCw size={10} /> {todo.repeat_schedule}</div>}</div>}</div>}</div><div className="ms-item-actions-row">{
    /* Date picker inline trigger */
  }<div className="ms-date-picker-wrap" ref={popoverRef}><button
    className="ms-action-btn"
    onClick={() => setShowDatePicker(!showDatePicker)}
    title="Set due date"
  ><CalendarDays size={SM} /></button>{showDatePicker && <div className="ms-date-popover"><input
    type="date"
    value={todo.due_date ? todo.due_date.substring(0, 10) : ""}
    onChange={(e) => {
      onUpdateDueDate(todo.id, e.target.value || null);
      setShowDatePicker(false);
    }}
  /><button onClick={() => {
    onUpdateDueDate(todo.id, null);
    setShowDatePicker(false);
  }} className="ms-clear-date-btn">
                Clear
              </button></div>}</div>{
    /* Note inline trigger */
  }<div className="ms-date-picker-wrap" ref={notePopoverRef}><button className="ms-action-btn" onClick={() => setShowNotePicker(!showNotePicker)} title="Add note"><NotebookPen size={SM} /></button>{showNotePicker && <div className="ms-popover-panel"><textarea placeholder="Add a note" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} /><div className="ms-popover-actions"><button className="ms-btn-save" onClick={() => {
    onUpdateNote(todo.id, noteDraft);
    setShowNotePicker(false);
  }}>Save</button><button className="ms-btn-clear" onClick={() => {
    setNoteDraft("");
    onUpdateNote(todo.id, null);
    setShowNotePicker(false);
  }}>Clear</button></div></div>}</div>{
    /* Reminder inline trigger */
  }<div className="ms-date-picker-wrap" ref={reminderPopoverRef}><button className="ms-action-btn" onClick={() => setShowReminderPicker(!showReminderPicker)} title="Remind me"><BellRing size={SM} /></button>{showReminderPicker && <div className="ms-popover-panel"><input type="datetime-local" value={reminderDraft} onChange={(e) => setReminderDraft(e.target.value)} /><div className="ms-popover-actions"><button className="ms-btn-save" onClick={() => {
    onUpdateReminder(todo.id, reminderDraft ? new Date(reminderDraft).toISOString() : null);
    setShowReminderPicker(false);
  }}>Save</button><button className="ms-btn-clear" onClick={() => {
    setReminderDraft("");
    onUpdateReminder(todo.id, null);
    setShowReminderPicker(false);
  }}>Clear</button></div></div>}</div>{
    /* Repeat inline trigger */
  }<div className="ms-date-picker-wrap" ref={repeatPopoverRef}><button className="ms-action-btn" onClick={() => setShowRepeatPicker(!showRepeatPicker)} title="Repeat"><RefreshCw size={SM} /></button>{showRepeatPicker && <div className="ms-popover-panel"><select value={repeatDraft} onChange={(e) => setRepeatDraft(e.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select><div className="ms-popover-actions"><button className="ms-btn-save" onClick={() => {
    onUpdateRepeat(todo.id, repeatDraft);
    setShowRepeatPicker(false);
  }}>Save</button><button className="ms-btn-clear" onClick={() => {
    setRepeatDraft("daily");
    onUpdateRepeat(todo.id, null);
    setShowRepeatPicker(false);
  }}>Clear</button></div></div>}</div>{editing ? <button id={`save-${todo.id}`} className="ms-action-btn save" onClick={save} title="Save"><Check size={SM} /></button> : !todo.completed && <button id={`edit-${todo.id}`} className="ms-action-btn" onClick={() => setEditing(true)} title="Edit"><Pencil size={SM} /></button>}<button id={`delete-${todo.id}`} className="ms-action-btn delete" onClick={() => onDelete(todo.id)} title="Delete"><Trash2 size={SM} /></button>{
    /* Star for toggle important */
  }<button
    className={`ms-star-btn${todo.important ? " starred" : ""}`}
    onClick={() => onToggleImportant(todo.id)}
    title={todo.important ? "Mark as not important" : "Mark as important"}
  ><Star size={16} fill={todo.important ? "#ffb900" : "none"} /></button></div></div>;
}
const NAV = [
  { icon: <Sun size={S} />, label: "My Day", id: "myday" },
  { icon: <Star size={S} />, label: "Important", id: "important" },
  { icon: <CalendarDays size={S} />, label: "Planned", id: "planned" },
  { icon: <Home size={S} />, label: "Tasks", id: "tasks" }
];
export default function TodoPage({ user, onLogout, onUpdateUser }) {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [newTaskNote, setNewTaskNote] = useState("");
  const [newTaskReminder, setNewTaskReminder] = useState("");
  const [newTaskRepeat, setNewTaskRepeat] = useState("");
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [showNewRepeat, setShowNewRepeat] = useState(false);
  const newNoteRef = useRef(null);
  const newReminderRef = useRef(null);
  const newRepeatRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [activeNav, setActiveNav] = useState("myday");
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1e4);
    return () => clearInterval(timer);
  }, []);
  const [lists, setLists] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingListId, setEditingListId] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState(user.name);
  const [editProfilePicture, setEditProfilePicture] = useState(user.profilePicture || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef(null);
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSaveProfile = async () => {
    if (!editProfileName.trim()) return;
    setIsSavingProfile(true);
    try {
      const { user: updatedUser } = await updateProfile(editProfileName, editProfilePicture);
      onUpdateUser(updatedUser);
      const session = loadSession();
      if (session) saveSession(session.token, updatedUser);
      setIsEditingProfile(false);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };
  const [listDraft, setListDraft] = useState("");
  const [groupDraft, setGroupDraft] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "info") => {
    const id = Date.now().toString() + Math.random().toString();
    console.log("Adding toast:", message, type);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4e3);
  };
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [groupBy, setGroupBy] = useState("none");
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const inputRef = useRef(null);
  const sortMenuRef = useRef(null);
  const groupMenuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (newNoteRef.current && !newNoteRef.current.contains(e.target)) setShowNewNote(false);
      if (newReminderRef.current && !newReminderRef.current.contains(e.target)) setShowNewReminder(false);
      if (newRepeatRef.current && !newRepeatRef.current.contains(e.target)) setShowNewRepeat(false);
      if (listOptionsRef.current && !listOptionsRef.current.contains(e.target)) setShowListOptions(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setShowNotifications(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [showListOptions, setShowListOptions] = useState(false);
  const listOptionsRef = useRef(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  useEffect(() => {
    fetchAppSettings().then(data => {
      setSettings(data);
      setIsSettingsLoaded(true);
    });
  }, []);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const [hasUnreadReminders, setHasUnreadReminders] = useState(false);
  const [hasSeenUpdates, setHasSeenUpdates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rightPanelWidth, setRightPanelWidth] = useState(() => Number(localStorage.getItem("right-panel-width")) || 360);
  const startResizing = (e) => {
    e.preventDefault();
    document.body.style.cursor = "ew-resize";
    const handleMouseMove = (e2) => {
      const newWidth = window.innerWidth - e2.clientX;
      if (newWidth > 250 && newWidth < 800) {
        setRightPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      setRightPanelWidth((w) => {
        localStorage.setItem("right-panel-width", w.toString());
        return w;
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  useEffect(() => {
    if (settings.darkMode) document.body.classList.add("dark-theme");
    else document.body.classList.remove("dark-theme");
    if (isSettingsLoaded) {
      saveAppSettings(settings);
    }
  }, [settings, isSettingsLoaded]);
  const [printSteps, setPrintSteps] = useState(true);
  const [printNotes, setPrintNotes] = useState(true);
  function handlePrint() {
    if (!printNotes) document.body.classList.add("no-print-notes");
    if (!printSteps) document.body.classList.add("no-print-steps");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("no-print-notes");
      document.body.classList.remove("no-print-steps");
      setShowPrintModal(false);
    }, 500);
  }
  const welcomeKey = `taskflow-welcomed-${user.id}`;
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem(welcomeKey));
  function dismissWelcome() {
    localStorage.setItem(welcomeKey, "1");
    setShowWelcome(false);
  }
  const [showDarkModeUpdate, setShowDarkModeUpdate] = useState(() => !localStorage.getItem("dismissed-dark-mode"));
  const [showResizeUpdate, setShowResizeUpdate] = useState(() => !localStorage.getItem("dismissed-resize"));
  function dismissDarkMode() {
    localStorage.setItem("dismissed-dark-mode", "1");
    setShowDarkModeUpdate(false);
  }
  function dismissResize() {
    localStorage.setItem("dismissed-resize", "1");
    setShowResizeUpdate(false);
  }
  useEffect(() => {
    Promise.all([getTodos(), getLists(), getGroups()]).then(([{ todos: todos2 }, { lists: lists2 }, { groups: groups2 }]) => {
      setTodos(todos2);
      setLists(lists2);
      setGroups(groups2);
    }).catch(() => setError("Failed to load tasks and lists.")).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    }
    if (showSortMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortMenu]);
  useEffect(() => {
    function handleClickOutside(e) {
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) {
        setShowGroupMenu(false);
      }
    }
    if (showGroupMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGroupMenu]);
  const getFilteredAndSortedTodos = () => {
    let result = [...todos];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.note && t.note.toLowerCase().includes(q)
      );
    } else {
      if (activeNav === "myday") {
        const todayStr2 = (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
        result = result.filter((t) => {
          const createdToday = t.created_at.substring(0, 10) === todayStr2;
          const dueToday = settings.showDueTodayInMyDay && t.due_date && t.due_date.substring(0, 10) === todayStr2;
          return createdToday || dueToday;
        });
      } else if (activeNav === "important") {
        result = result.filter((t) => t.important);
      } else if (activeNav === "planned") {
        result = result.filter((t) => t.due_date);
      } else if (activeNav === "tasks") {
        result = result.filter((t) => t.list_id === null);
      } else if (activeNav.startsWith("list-")) {
        const listId = Number(activeNav.substring(5));
        result = result.filter((t) => t.list_id === listId);
      }
    }
    if (sortBy === "default") {
      if (settings.moveStarredToTop) {
        result.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
      }
      if (settings.addNewTasksOnTop) {
        result.sort((a, b) => {
          if (a.important === b.important) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });
      }
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "dueDate") {
      result.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else if (sortBy === "importance") {
      result.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
    } else if (sortBy === "creationDate") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return result;
  };
  const filteredTodos = getFilteredAndSortedTodos();
  const activeReminders = todos.filter((t) => {
    if (!t.reminder || t.completed) return false;
    return new Date(t.reminder).getTime() <= currentTime;
  });
  const hasNewReminders = hasUnreadReminders;
  const hasNewUpdates = !hasSeenUpdates && (showDarkModeUpdate || showResizeUpdate);
  const hasNotifications = hasNewReminders || hasNewUpdates;
  const activeTodos = filteredTodos.filter((t) => !t.completed);
  const completedTodos = filteredTodos.filter((t) => t.completed);
  const prevRemindersCount = useRef(0);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      prevRemindersCount.current = activeReminders.length;
      isFirstRender.current = false;
      return;
    }
    if (activeReminders.length > prevRemindersCount.current) {
      if (settings.reminderNotifications) {
        playNotificationAudio();
        addToast("You have a new reminder!", "info");
      }
      setHasUnreadReminders(true);
    }
    prevRemindersCount.current = activeReminders.length;
  }, [activeReminders.length, settings.reminderNotifications]);
  const completedCount = todos.filter((t) => t.completed).length;
  const pct = todos.length > 0 ? Math.round(completedCount / todos.length * 100) : 0;
  async function handleAdd() {
    const title = input.trim();
    if (!title) return;
    setAdding(true);
    try {
      const isImportant = activeNav === "important";
      const dueDate = activeNav === "planned" ? (/* @__PURE__ */ new Date()).toISOString().split("T")[0] : null;
      const listId = activeNav.startsWith("list-") ? Number(activeNav.substring(5)) : null;
      const notePayload = newTaskNote.trim() ? newTaskNote.trim() : null;
      const reminderPayload = newTaskReminder ? new Date(newTaskReminder).toISOString() : null;
      const repeatPayload = newTaskRepeat ? newTaskRepeat : null;
      const { todo } = await createTodo(title, isImportant, dueDate, listId, notePayload, reminderPayload, repeatPayload);
      setTodos((prev) => [...prev, todo]);
      setInput("");
      setNewTaskNote("");
      setNewTaskReminder("");
      setNewTaskRepeat("");
    } catch {
      setError("Could not add task.");
    } finally {
      setAdding(false);
    }
  }
  async function handleToggle(id) {
    try {
      const { todo } = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => t.id === id ? todo : t));
      console.log("Toggled todo:", todo);
      if (todo.completed) {
        if (settings.playCompletionSound) {
          playCompletionAudio();
        }
        addToast(`Task completed: ${todo.title}`, "success");
      }
    } catch (e) {
      console.error("Toggle error:", e);
      setError("Could not update task.");
    }
  }
  async function handleDelete(id) {
    const performDelete = async () => {
      try {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        setError("Could not delete task.");
      }
    };
    if (settings.confirmBeforeDeleting) {
      setConfirmState({
        title: "Delete Task",
        message: "Are you sure you want to delete this task? This action cannot be undone.",
        onConfirm: performDelete
      });
      return;
    }
    performDelete();
  }
  async function handleUpdate(id, title) {
    try {
      const { todo } = await updateTodo(id, { title });
      setTodos((prev) => prev.map((t) => t.id === id ? todo : t));
    } catch {
      setError("Could not update task.");
    }
  }
  async function handleToggleImportant(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const { todo: updated } = await updateTodo(id, { important: !todo.important });
      setTodos((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch {
      setError("Could not update task.");
    }
  }
  async function handleUpdateDueDate(id, due_date) {
    try {
      const { todo: updated } = await updateTodo(id, { due_date });
      setTodos((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch {
      setError("Could not update task.");
    }
  }
  async function handleUpdateNote(id, note) {
    try {
      const { todo: updated } = await updateTodo(id, { note });
      setTodos((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch {
      setError("Could not update task.");
    }
  }
  async function handleUpdateReminder(id, reminder) {
    try {
      const { todo: updated } = await updateTodo(id, { reminder });
      setTodos((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch {
      setError("Could not update task.");
    }
  }
  async function handleUpdateRepeat(id, repeat_schedule) {
    try {
      const { todo: updated } = await updateTodo(id, { repeat_schedule });
      setTodos((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch {
      setError("Could not update task.");
    }
  }
  async function clearCompleted() {
    const done = todos.filter((t) => t.completed);
    await Promise.all(done.map((t) => deleteTodo(t.id)));
    setTodos((prev) => prev.filter((t) => !t.completed));
  }
  async function handleCreateNewList() {
    try {
      const { list } = await createList("Untitled list");
      setLists((prev) => [...prev, list]);
      setActiveNav(`list-${list.id}`);
      setEditingListId(list.id);
      setListDraft("Untitled list");
    } catch {
      setError("Could not create list.");
    }
  }
  async function handleCreateNewGroup() {
    try {
      const { group } = await createGroup("Untitled group");
      setGroups((prev) => [...prev, group]);
      setEditingGroupId(group.id);
      setGroupDraft("Untitled group");
    } catch {
      setError("Could not create group.");
    }
  }
  async function handleSaveListRename(id) {
    const name = listDraft.trim();
    if (!name) return setEditingListId(null);
    try {
      const { list } = await updateList(id, { name });
      setLists((prev) => prev.map((l) => l.id === id ? list : l));
    } catch {
      setError("Could not rename list.");
    } finally {
      setEditingListId(null);
    }
  }
  async function handleSaveGroupRename(id) {
    const name = groupDraft.trim();
    if (!name) return setEditingGroupId(null);
    try {
      const { group } = await updateGroup(id, name);
      setGroups((prev) => prev.map((g) => g.id === id ? group : g));
    } catch {
      setError("Could not rename group.");
    } finally {
      setEditingGroupId(null);
    }
  }
  async function handleMoveListToGroup(listId, groupId) {
    try {
      const { list } = await updateList(listId, { group_id: groupId });
      setLists((prev) => prev.map((l) => l.id === listId ? list : l));
    } catch {
      setError("Could not move list.");
    }
  }
  async function handleDeleteList(id) {
    const performDelete = async () => {
      try {
        await deleteList(id);
        setLists((prev) => prev.filter((l) => l.id !== id));
        setTodos((prev) => prev.filter((t) => t.list_id !== id));
        if (activeNav === `list-${id}`) {
          setActiveNav("tasks");
        }
      } catch {
        setError("Could not delete list.");
      }
    };
    if (settings.confirmBeforeDeleting) {
      setConfirmState({
        title: "Delete List",
        message: "Are you sure you want to delete this list? All tasks inside it will also be deleted.",
        onConfirm: performDelete
      });
      return;
    }
    performDelete();
  }
  async function handleDeleteGroup(id) {
    const performDelete = async () => {
      try {
        await deleteGroup(id);
        setGroups((prev) => prev.filter((g) => g.id !== id));
        setLists((prev) => prev.map((l) => l.group_id === id ? { ...l, group_id: null } : l));
      } catch {
        setError("Could not delete group.");
      }
    };
    if (settings.confirmBeforeDeleting) {
      setConfirmState({
        title: "Delete Group",
        message: "Are you sure you want to delete this group? The lists inside will not be deleted, but will be removed from the group.",
        onConfirm: performDelete
      });
      return;
    }
    performDelete();
  }
  const getActiveViewMeta = () => {
    if (searchQuery.trim()) {
      return {
        title: `Search: "${searchQuery}"`,
        icon: <Search size={22} />,
        color: "var(--ms-blue)",
        emptyText: "No tasks match your search."
      };
    }
    if (activeNav.startsWith("list-")) {
      const listId = Number(activeNav.substring(5));
      const list = lists.find((l) => l.id === listId);
      return {
        title: list ? list.name : "Untitled list",
        icon: <ListIcon size={22} />,
        color: "var(--ms-blue)",
        emptyText: "This list is empty."
      };
    }
    return {
      myday: {
        title: "My Day",
        icon: <Sun size={22} />,
        color: "var(--ms-blue)",
        emptyText: "Focus on your day here."
      },
      important: {
        title: "Important",
        icon: <Star size={22} />,
        color: "#d13438",
        // Dark Pink/Red
        emptyText: "Try adding a task to Important."
      },
      planned: {
        title: "Planned",
        icon: <CalendarDays size={22} />,
        color: "#0078d4",
        emptyText: "Tasks with due dates show up here."
      },
      assigned: {
        title: "Assigned to me",
        icon: <CircleUser size={22} />,
        color: "var(--ms-success)",
        emptyText: "Tasks assigned to you show up here."
      },
      tasks: {
        title: "Tasks",
        icon: <Home size={22} />,
        color: "var(--ms-blue)",
        emptyText: "Add a task to get started."
      }
    }[activeNav] || {
      title: "Tasks",
      icon: <Home size={22} />,
      color: "var(--ms-blue)",
      emptyText: "Add a task to get started."
    };
  };
  const viewMeta = getActiveViewMeta();
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const tomorrow = /* @__PURE__ */ new Date();
  tomorrow.setDate((/* @__PURE__ */ new Date()).getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const effectiveGroupBy = groupBy !== "none" ? groupBy : activeNav === "planned" && sortBy === "default" ? "dueDate" : "none";
  const toggleGroupCollapse = (groupKey) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };
  const renderGroupSection = (groupKey, title, tasks, sectionColor) => {
    if (tasks.length === 0) return null;
    const isExpanded = !collapsedGroups[groupKey];
    return <div key={groupKey} className="ms-group-section"><div
      className={`ms-planned-section-title${!isExpanded ? " collapsed" : ""}`}
      style={{ color: sectionColor, cursor: "pointer", userSelect: "none" }}
      onClick={() => toggleGroupCollapse(groupKey)}
    ><ChevronDown
      size={12}
      style={{
        transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 0.2s",
        marginRight: 4
      }}
    /><span>{title} • {tasks.length}</span></div>{isExpanded && <div className={`ms-task-list ${viewMode === "grid" ? "grid-layout" : ""}`}>{tasks.map((todo) => <TaskItem
      key={todo.id}
      todo={todo}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      onToggleImportant={handleToggleImportant}
      onUpdateDueDate={handleUpdateDueDate}
      onUpdateNote={handleUpdateNote}
      onUpdateReminder={handleUpdateReminder}
      onUpdateRepeat={handleUpdateRepeat}
    />)}</div>}</div>;
  };
  function renderListRow(list) {
    const isEditing = editingListId === list.id;
    const isActive = activeNav === `list-${list.id}`;
    const listTodos = todos.filter((t) => t.list_id === list.id);
    const activeCount = listTodos.filter((t) => !t.completed).length;
    return <div
      key={list.id}
      className={`nav-item nav-custom-list${isActive ? " active" : ""}`}
      onClick={() => setActiveNav(`list-${list.id}`)}
    ><ListIcon size={S} className="nav-icon" style={{ color: isActive ? viewMeta.color : void 0 }} />{isEditing ? <input
      className="list-edit-input"
      value={listDraft}
      onChange={(e) => setListDraft(e.target.value)}
      onBlur={() => handleSaveListRename(list.id)}
      onKeyDown={(e) => e.key === "Enter" && handleSaveListRename(list.id)}
      onClick={(e) => e.stopPropagation()}
      autoFocus
    /> : <span
      className="list-title-text"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditingListId(list.id);
        setListDraft(list.name);
      }}
    >{list.name}</span>}{activeCount > 0 && <span className="list-badge">{activeCount}</span>}{!isEditing && <div className="list-row-actions">{groups.length > 0 && <select
      className="list-move-select"
      value={list.group_id || ""}
      onChange={(e) => {
        e.stopPropagation();
        handleMoveListToGroup(list.id, e.target.value ? Number(e.target.value) : null);
      }}
      onClick={(e) => e.stopPropagation()}
      title="Move to group"
    ><option value="">No Group</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>}<button
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteList(list.id);
      }}
      title="Delete list"
      className="list-delete-btn"
    ><Trash2 size={12} /></button></div>}</div>;
  }
  return <>{showWelcome && <WelcomeModal userName={user.name} onClose={dismissWelcome} />}{confirmState && <ConfirmModal
    title={confirmState.title}
    message={confirmState.message}
    onConfirm={() => {
      confirmState.onConfirm();
      setConfirmState(null);
    }}
    onCancel={() => setConfirmState(null)}
  />}{
    /* Toast Notifications */
  }<div className="ms-toast-container">{toasts.map((t) => <div key={t.id} className={`ms-toast ms-toast-${t.type || "info"}`}>{t.type === "success" && <Check size={16} style={{ marginRight: 8, flexShrink: 0 }} />}{t.message}</div>)}</div><div className="app-wrapper">{
    /* ── Top bar ─────────────────────────────────────────────────────── */
  }<div className="top-bar"><button
    id="sidebar-toggle"
    className="top-bar-btn-icon"
    title="Collapse/Expand menus"
    onClick={() => {
      if (window.innerWidth <= 600) {
        setMobileOpen(!mobileOpen);
      } else {
        setSidebarCollapsed(!sidebarCollapsed);
      }
    }}
  ><Menu size={S} /></button><span className="top-bar-logo">To Do</span><div className="top-bar-search-wrap"><span className="top-bar-search-icon"><Search size={14} /></span><input
    className="top-bar-search"
    type="search"
    placeholder="Search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  /></div><div className="top-bar-right"><button className="top-bar-btn-icon" title="Settings" onClick={() => setShowSettings(!showSettings)}><Settings size={S} /></button><button className="top-bar-btn-icon" title="What's new" onClick={() => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnreadReminders(false);
      setHasSeenUpdates(true);
    }
  }} style={{ position: "relative" }}><Megaphone size={S} />{hasNotifications && <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#d32f2f", borderRadius: "50%" }} />}</button><div className="top-bar-profile-container" ref={profileMenuRef}><div
    className="top-bar-avatar"
    title={user.name}
    onClick={() => setShowProfileMenu(!showProfileMenu)}
  >{user.profilePicture ? <img src={user.profilePicture} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials(user.name)}</div>{showProfileMenu && <div className="ms-profile-popover"><div className="ms-profile-header"><div /><button className="ms-profile-signout" onClick={onLogout}>Sign out</button></div><div className="ms-profile-body">{isEditingProfile ? <div className="ms-profile-edit-form"><div className="ms-profile-avatar-large editing" onClick={() => fileInputRef.current?.click()}>{editProfilePicture ? <img src={editProfilePicture} alt="Avatar" className="ms-profile-avatar-img" /> : initials(user.name)}<div className="ms-profile-avatar-overlay">Change</div></div><input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleProfilePhotoChange} /><input
    type="text"
    className="ms-profile-edit-input"
    value={editProfileName}
    onChange={(e) => setEditProfileName(e.target.value)}
    autoFocus
    placeholder="Your Name"
  /><div className="ms-profile-edit-actions"><button disabled={isSavingProfile} onClick={() => {
    setIsEditingProfile(false);
    setEditProfileName(user.name);
    setEditProfilePicture(user.profilePicture || "");
  }}>Cancel</button><button disabled={isSavingProfile} onClick={handleSaveProfile} className="primary">{isSavingProfile ? "Saving..." : "Save"}</button></div></div> : <><div className="ms-profile-avatar-large">{user.profilePicture ? <img src={user.profilePicture} alt="Avatar" className="ms-profile-avatar-img" /> : initials(user.name)}</div><div className="ms-profile-info"><div className="ms-profile-name">{user.name}</div><div className="ms-profile-email">{user.email}</div><a href="#" className="ms-profile-link" onClick={(e) => {
    e.preventDefault();
    setIsEditingProfile(true);
  }}>Edit profile</a></div></>}</div></div>}</div></div></div>{
    /* ── App body ────────────────────────────────────────────────────── */
  }<div className="app-body">{
    /* Sidebar */
  }<aside className={`sidebar${sidebarCollapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}><nav className="nav-list">{
    /* Static top navigation */
  }{NAV.filter((item) => {
    if (item.id === "important") {
      if (!settings.smartListImportant) return false;
      if (settings.autoHideEmptySmartLists && todos.filter((t) => t.important && !t.completed).length === 0) return false;
      return true;
    }
    if (item.id === "planned") {
      if (!settings.smartListPlanned) return false;
      if (settings.autoHideEmptySmartLists && todos.filter((t) => t.due_date && !t.completed).length === 0) return false;
      return true;
    }
    if (item.id === "all") {
      if (!settings.smartListAll) return false;
      if (settings.autoHideEmptySmartLists && todos.filter((t) => !t.completed).length === 0) return false;
      return true;
    }
    if (item.id === "completed") {
      if (!settings.smartListCompleted) return false;
      if (settings.autoHideEmptySmartLists && todos.filter((t) => t.completed).length === 0) return false;
      return true;
    }
    return true;
  }).map(({ icon, label, id }) => <button
    key={id}
    id={`nav-${id}`}
    className={`nav-item${activeNav === id ? " active" : ""}`}
    onClick={() => setActiveNav(id)}
  ><span className="nav-icon" style={{ color: activeNav === id ? viewMeta.color : void 0 }}>{icon}</span>{label}</button>)}<div className="sidebar-divider" />{
    /* Scrollable area for custom lists and groups */
  }<div className="nav-scrollable-area">{
    /* List Groups */
  }{groups.map((group) => {
    const isEditing = editingGroupId === group.id;
    const groupLists = lists.filter((l) => l.group_id === group.id);
    return <div key={group.id} className="sidebar-group-container"><div className="sidebar-group-header"><Folder size={14} className="group-icon" />{isEditing ? <input
      className="group-edit-input"
      value={groupDraft}
      onChange={(e) => setGroupDraft(e.target.value)}
      onBlur={() => handleSaveGroupRename(group.id)}
      onKeyDown={(e) => e.key === "Enter" && handleSaveGroupRename(group.id)}
      autoFocus
    /> : <span
      className="group-title"
      onDoubleClick={() => {
        setEditingGroupId(group.id);
        setGroupDraft(group.name);
      }}
    >{group.name}</span>}{!isEditing && <div className="group-actions"><button
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteGroup(group.id);
      }}
      title="Delete group"
    ><Trash2 size={12} /></button></div>}</div><div className="group-lists-container">{groupLists.map((list) => renderListRow(list))}</div></div>;
  })}{
    /* Ungrouped custom lists */
  }{lists.filter((l) => !l.group_id).map((list) => renderListRow(list))}</div>{
    /* Custom New List / Group creation bottom-bar row */
  }<div className="nav-new-list-row"><button className="nav-new-list-btn" onClick={handleCreateNewList}><Plus size={S} /><span>New list</span></button><button className="nav-new-group-btn" onClick={handleCreateNewGroup} title="Create group"><FolderPlus size={S} /></button></div></nav></aside>{
    /* ── Main area ───────────────────────────────────────────────── */
  }<main className="main-area">{
    /* Header */
  }<div className="content-header"><div className="content-title-row"><div className="content-title" style={{ color: viewMeta.color }}>{viewMeta.icon}{viewMeta.title}<div style={{ position: "relative" }} ref={listOptionsRef}><button className="content-title-dots" title="More options" onClick={() => setShowListOptions(!showListOptions)}><MoreHorizontal size={S} /></button>{showListOptions && <div className="ms-list-options-popover"><div className="ms-list-options-header">List options</div><button className="ms-list-option-btn" onClick={() => {
    setShowListOptions(false);
    setShowPrintModal(true);
  }}><Printer size={16} /> Print list
                        </button></div>}</div></div><div className="content-view-toggle"><button
    className={`btn-view${viewMode === "grid" ? " active" : ""}`}
    style={{ color: viewMode === "grid" ? viewMeta.color : void 0, background: viewMode === "grid" ? `${viewMeta.color}15` : void 0 }}
    onClick={() => setViewMode("grid")}
    title="Grid view"
  ><LayoutGrid size={SM} /> Grid
                  </button><button
    className={`btn-view${viewMode === "list" ? " active" : ""}`}
    style={{ color: viewMode === "list" ? viewMeta.color : void 0, background: viewMode === "list" ? `${viewMeta.color}15` : void 0 }}
    onClick={() => setViewMode("list")}
    title="List view"
  ><ListIcon size={SM} /> List
                  </button></div></div>{activeNav === "myday" && <div className="content-date" style={{ color: viewMeta.color }}>{formatDate()}</div>}{activeNav === "important" && <div className="content-date" style={{ color: viewMeta.color }}>Sorted by importance</div>}</div>{
    /* Toolbar */
  }<div className="content-toolbar">{
    /* Sort button with custom dropdown */
  }{activeNav !== "assigned" && <div className="ms-menu-container" ref={sortMenuRef}><button className="btn-toolbar" onClick={() => setShowSortMenu(!showSortMenu)}><ArrowUpDown size={SM} />
                    Sort{sortBy !== "default" ? ": " + sortBy : ""}</button>{showSortMenu && <div className="ms-dropdown-menu"><button className={`ms-dropdown-item${sortBy === "importance" ? " active" : ""}`} onClick={() => {
    setSortBy("importance");
    setShowSortMenu(false);
  }}><Star size={12} style={{ marginRight: 6 }} /> Importance
                      </button><button className={`ms-dropdown-item${sortBy === "dueDate" ? " active" : ""}`} onClick={() => {
    setSortBy("dueDate");
    setShowSortMenu(false);
  }}><CalendarDays size={12} style={{ marginRight: 6 }} /> Due date
                      </button><button className={`ms-dropdown-item${sortBy === "title" ? " active" : ""}`} onClick={() => {
    setSortBy("title");
    setShowSortMenu(false);
  }}><ArrowUpDown size={12} style={{ marginRight: 6 }} /> Alphabetically
                      </button><button className={`ms-dropdown-item${sortBy === "creationDate" ? " active" : ""}`} onClick={() => {
    setSortBy("creationDate");
    setShowSortMenu(false);
  }}><RefreshCw size={12} style={{ marginRight: 6 }} /> Creation date
                      </button><div className="sidebar-divider" /><button className="ms-dropdown-item" onClick={() => {
    setSortBy("default");
    setShowSortMenu(false);
  }}>
                        Reset
                      </button></div>}</div>}<div className="ms-menu-container" ref={groupMenuRef}><button className="btn-toolbar" onClick={() => setShowGroupMenu(!showGroupMenu)}><Layers size={SM} />
                  Group{groupBy !== "none" ? ": " + (groupBy === "dueDate" ? "Due date" : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)) : ""}</button>{showGroupMenu && <div className="ms-dropdown-menu"><button className={`ms-dropdown-item${groupBy === "completed" ? " active" : ""}`} onClick={() => {
    setGroupBy("completed");
    setShowGroupMenu(false);
  }}><Check size={12} style={{ marginRight: 6 }} /> Completed
                    </button><button className={`ms-dropdown-item${groupBy === "importance" ? " active" : ""}`} onClick={() => {
    setGroupBy("importance");
    setShowGroupMenu(false);
  }}><Star size={12} style={{ marginRight: 6 }} /> Importance
                    </button><button className={`ms-dropdown-item${groupBy === "dueDate" ? " active" : ""}`} onClick={() => {
    setGroupBy("dueDate");
    setShowGroupMenu(false);
  }}><CalendarDays size={12} style={{ marginRight: 6 }} /> Due date
                    </button><div className="sidebar-divider" /><button className="ms-dropdown-item" onClick={() => {
    setGroupBy("none");
    setShowGroupMenu(false);
  }}>
                      None
                    </button></div>}</div></div>{
    /* Task area */
  }<div className="task-area">{error && <div style={{ padding: "10px 24px" }}><div className="auth-error" style={{ borderRadius: 6, marginBottom: 0 }}>{error}</div></div>}{
    /* Progress bar */
  }{todos.length > 0 && <div className="ms-progress-wrap" style={{ display: "flex", gap: "16px", padding: "16px 24px", flexWrap: "wrap", background: "var(--ms-bg-secondary)", borderBottom: "1px solid var(--ms-border)" }}>
    <div style={{ flex: "1 1 220px", background: "var(--ms-bg)", border: "1px solid var(--ms-border)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
      <span className="ms-progress-label" style={{ fontSize: "18px", fontWeight: "600", color: "var(--ms-text)", letterSpacing: "-0.3px" }}>
        {completedCount} of {todos.length} tasks completed
      </span>
      <span className="ms-progress-pct" style={{ fontSize: "15px", fontWeight: "500", color: pct === 100 ? "var(--ms-success)" : viewMeta.color }}>
        {pct === 100 ? "\u{1F389} Great job, you're all done!" : `${pct}% completed`}
      </span>
    </div>
    <div style={{ flex: "1 1 220px", background: "var(--ms-bg)", border: "1px solid var(--ms-border)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--ms-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overall Progress</span>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="76" height="76" viewBox="0 0 42 42" className="ms-pie-chart" style={{ transform: "rotate(-90deg)", borderRadius: "50%", flexShrink: 0 }}>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--ms-border)" strokeWidth="3.5"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={pct === 100 ? "var(--ms-success)" : viewMeta.color} strokeWidth="4" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="0" strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease" }}></circle>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "18px", fontWeight: "700", color: pct === 100 ? "var(--ms-success)" : viewMeta.color }}>
            {pct}%
          </span>
        </div>
      </div>
    </div>
  </div>}{
    /* Add task */
  }<div className="add-task-section"><div className="add-task-row" onClick={() => inputRef.current?.focus()}><div className="add-task-circle" style={{ borderColor: viewMeta.color, color: viewMeta.color }}><Plus size={12} strokeWidth={2.5} /></div><input
    id="todo-input"
    ref={inputRef}
    className="add-task-input"
    placeholder="Add a task"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
  /></div><div className="add-task-subbar">{
    /* New Task Note */
  }<div className="ms-menu-container" ref={newNoteRef}><button className={`add-subbar-btn${newTaskNote ? " active" : ""}`} onClick={() => setShowNewNote(!showNewNote)} title="Note"><NotebookPen size={SM} /></button>{showNewNote && <div className="ms-popover-panel" style={{ bottom: "34px", left: 0, right: "auto" }}><textarea placeholder="Add a note" value={newTaskNote} onChange={(e) => setNewTaskNote(e.target.value)} /><div className="ms-popover-actions"><button className="ms-btn-save" onClick={() => setShowNewNote(false)}>Done</button><button className="ms-btn-clear" onClick={() => {
    setNewTaskNote("");
    setShowNewNote(false);
  }}>Clear</button></div></div>}</div>{
    /* New Task Reminder */
  }<div className="ms-menu-container" ref={newReminderRef}><button className={`add-subbar-btn${newTaskReminder ? " active" : ""}`} onClick={() => setShowNewReminder(!showNewReminder)} title="Reminder"><BellRing size={SM} /></button>{showNewReminder && <div className="ms-popover-panel" style={{ bottom: "34px", left: 0, right: "auto" }}><input type="datetime-local" value={newTaskReminder} onChange={(e) => setNewTaskReminder(e.target.value)} /><div className="ms-popover-actions"><button className="ms-btn-save" onClick={() => setShowNewReminder(false)}>Done</button><button className="ms-btn-clear" onClick={() => {
    setNewTaskReminder("");
    setShowNewReminder(false);
  }}>Clear</button></div></div>}</div>{
    /* New Task Repeat */
  }<div className="ms-menu-container" ref={newRepeatRef}><button className={`add-subbar-btn${newTaskRepeat ? " active" : ""}`} onClick={() => setShowNewRepeat(!showNewRepeat)} title="Repeat"><RefreshCw size={SM} /></button>{showNewRepeat && <div className="ms-popover-panel" style={{ bottom: "34px", left: 0, right: "auto" }}><select value={newTaskRepeat || "daily"} onChange={(e) => setNewTaskRepeat(e.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select><div className="ms-popover-actions"><button className="ms-btn-save" onClick={() => setShowNewRepeat(false)}>Done</button><button className="ms-btn-clear" onClick={() => {
    setNewTaskRepeat("");
    setShowNewRepeat(false);
  }}>Clear</button></div></div>}</div><button
    id="todo-add-btn"
    className="btn-add"
    style={{ backgroundColor: viewMeta.color }}
    onClick={handleAdd}
    disabled={adding || !input.trim()}
  >{adding ? "Adding\u2026" : "Add"}</button></div></div>{
    /* Task list / Empty view */
  }{loading ? <div className="ms-loading"><div className="ms-loader" style={{ borderTopColor: viewMeta.color }} /></div> : filteredTodos.length === 0 ? <div className="ms-empty"><div className="ms-empty-icon" style={{ color: viewMeta.color }}>{viewMeta.icon}</div><span className="ms-empty-text">{viewMeta.emptyText}</span></div> : <div className="ms-task-lists-container">{effectiveGroupBy === "completed" && <>{renderGroupSection("active", "Active", activeTodos)}{renderGroupSection("completed", "Completed", completedTodos)}</>}{effectiveGroupBy === "importance" && <>{renderGroupSection("important", "Important", activeTodos.filter((t) => t.important))}{renderGroupSection("tasks", "Tasks", activeTodos.filter((t) => !t.important))}</>}{effectiveGroupBy === "dueDate" && <>{renderGroupSection("overdue", "Overdue", activeTodos.filter((t) => t.due_date && t.due_date.substring(0, 10) < todayStr), "var(--ms-danger)")}{renderGroupSection("today", "Today", activeTodos.filter((t) => t.due_date && t.due_date.substring(0, 10) === todayStr), viewMeta.color)}{renderGroupSection("tomorrow", "Tomorrow", activeTodos.filter((t) => t.due_date && t.due_date.substring(0, 10) === tomorrowStr))}{renderGroupSection("later", "Later", activeTodos.filter((t) => t.due_date && t.due_date.substring(0, 10) > tomorrowStr))}{renderGroupSection("noDueDate", "No due date", activeTodos.filter((t) => !t.due_date))}</>}{effectiveGroupBy === "none" && /* Normal active list */
  (activeTodos.length > 0 && <div className={`ms-task-list ${viewMode === "grid" ? "grid-layout" : ""}`}>{activeTodos.map((todo) => <TaskItem
    key={todo.id}
    todo={todo}
    onToggle={handleToggle}
    onDelete={handleDelete}
    onUpdate={handleUpdate}
    onToggleImportant={handleToggleImportant}
    onUpdateDueDate={handleUpdateDueDate}
    onUpdateNote={handleUpdateNote}
    onUpdateReminder={handleUpdateReminder}
    onUpdateRepeat={handleUpdateRepeat}
  />)}</div>)}{
    /* Completed tasks collapsible section - ONLY shown when NOT grouped by completion */
  }{effectiveGroupBy !== "completed" && completedTodos.length > 0 && <div className="ms-completed-section"><div
    className={`ms-completed-toggle${!completedExpanded ? " collapsed" : ""}`}
    onClick={() => setCompletedExpanded(!completedExpanded)}
  ><ChevronDown size={14} /><span>Completed • {completedTodos.length}</span><div className="ms-completed-line" /></div>{completedExpanded && <div className={`ms-task-list ${viewMode === "grid" ? "grid-layout" : ""}`}>{completedTodos.map((todo) => <TaskItem
    key={todo.id}
    todo={todo}
    onToggle={handleToggle}
    onDelete={handleDelete}
    onUpdate={handleUpdate}
    onToggleImportant={handleToggleImportant}
    onUpdateDueDate={handleUpdateDueDate}
    onUpdateNote={handleUpdateNote}
    onUpdateReminder={handleUpdateReminder}
    onUpdateRepeat={handleUpdateRepeat}
  />)}</div>}</div>}{todos.some((t) => t.completed) && <div style={{ padding: "16px 24px" }}><button
    id="clear-completed-btn"
    onClick={clearCompleted}
    style={{ fontSize: 13, color: "var(--ms-text-muted)", textDecoration: "underline", textUnderlineOffset: 2 }}
  >
                        Clear completed tasks
                      </button></div>}</div>}</div></main></div></div>{
    /* Notifications Right Panel */
  }<div className={`ms-right-panel ${showNotifications ? "open" : ""}`} ref={notificationsRef} style={{ width: rightPanelWidth, right: showNotifications ? 0 : -rightPanelWidth }}><div className="ms-right-panel-resizer" onMouseDown={startResizing} /><div className="ms-right-panel-header"><h2>What's new</h2><button className="ms-right-panel-close" onClick={() => setShowNotifications(false)}><X size={16} /></button></div><div className="ms-right-panel-body"><div className="ms-notif-section"><h3 className="ms-notif-section-title">Reminders</h3>{activeReminders.length === 0 ? <div className="ms-notif-empty">No notifications</div> : <div className="ms-notif-list">{activeReminders.map((r) => <div key={r.id} className="ms-notif-item"><div className="ms-notif-title">{r.title}</div><div className="ms-notif-time">{new Date(r.reminder).toLocaleString()}</div></div>)}</div>}</div><div className="ms-notif-section"><h3 className="ms-notif-section-title">Updates</h3>{!showDarkModeUpdate && !showResizeUpdate && <p className="ms-notif-empty">No new updates</p>}{
    /* Dark Mode Card */
  }{showDarkModeUpdate && <div className="ms-whatsnew-card"><div className="ms-whatsnew-image"><div className="ms-fake-window-bg" /><div className="ms-fake-window-fg" /><div className="ms-star ms-star-1" /><div className="ms-star ms-star-2" /><div className="ms-star ms-star-3" /></div><div className="ms-whatsnew-content"><p>Now you can change to Darkmode theme from settings!</p><button className="ms-whatsnew-btn" onClick={() => {
    setSettings({ ...settings, darkMode: true });
    dismissDarkMode();
    setShowNotifications(false);
  }}>Try it</button></div></div>}{
    /* Resize Card */
  }{showResizeUpdate && <div className="ms-whatsnew-card"><div className="ms-whatsnew-image ms-whatsnew-resize"><div className="ms-fake-window-panel" /><div className="ms-fake-window-panel small" /><div className="ms-resize-icon">&harr;</div><div className="ms-star ms-star-1" /><div className="ms-star ms-star-2" /></div><div className="ms-whatsnew-content"><p>Now you can resize your details pane</p><button className="ms-whatsnew-btn" onClick={() => {
    dismissResize();
    setShowNotifications(false);
  }}>Try it</button></div></div>}</div></div></div>{
    /* Settings Right Panel */
  }<div className={`ms-right-panel ${showSettings ? "open" : ""}`} ref={settingsRef} style={{ width: rightPanelWidth, right: showSettings ? 0 : -rightPanelWidth }}><div className="ms-right-panel-resizer" onMouseDown={startResizing} /><div className="ms-right-panel-header"><h2>Settings</h2><button className="ms-right-panel-close" onClick={() => setShowSettings(false)}><X size={16} /></button></div><div className="ms-right-panel-body"><div className="ms-settings-section"><h3 className="ms-settings-section-title">General</h3><div className="ms-setting-item"><label>Confirm before deleting</label><label className="ms-toggle"><input type="checkbox" checked={settings.confirmBeforeDeleting} onChange={(e) => setSettings({ ...settings, confirmBeforeDeleting: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Add new tasks on top</label><label className="ms-toggle"><input type="checkbox" checked={settings.addNewTasksOnTop} onChange={(e) => setSettings({ ...settings, addNewTasksOnTop: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Move starred tasks to top</label><label className="ms-toggle"><input type="checkbox" checked={settings.moveStarredToTop} onChange={(e) => setSettings({ ...settings, moveStarredToTop: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Play completion sound</label><label className="ms-toggle"><input type="checkbox" checked={settings.playCompletionSound} onChange={(e) => setSettings({ ...settings, playCompletionSound: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Show right-click menus</label><label className="ms-toggle"><input type="checkbox" checked={settings.showRightClickMenus} onChange={(e) => setSettings({ ...settings, showRightClickMenus: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Turn on reminder notifications</label><label className="ms-toggle"><input type="checkbox" checked={settings.reminderNotifications} onChange={(e) => setSettings({ ...settings, reminderNotifications: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Turn on dark mode</label><label className="ms-toggle"><input type="checkbox" checked={settings.darkMode} onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })} /><span className="ms-toggle-slider" /></label></div></div><div className="ms-settings-section"><h3 className="ms-settings-section-title">Smart lists</h3><div className="ms-setting-item"><label>Important</label><label className="ms-toggle"><input type="checkbox" checked={settings.smartListImportant} onChange={(e) => setSettings({ ...settings, smartListImportant: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Planned</label><label className="ms-toggle"><input type="checkbox" checked={settings.smartListPlanned} onChange={(e) => setSettings({ ...settings, smartListPlanned: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>All</label><label className="ms-toggle"><input type="checkbox" checked={settings.smartListAll} onChange={(e) => setSettings({ ...settings, smartListAll: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Completed</label><label className="ms-toggle"><input type="checkbox" checked={settings.smartListCompleted} onChange={(e) => setSettings({ ...settings, smartListCompleted: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Auto-hide empty smart lists</label><label className="ms-toggle"><input type="checkbox" checked={settings.autoHideEmptySmartLists} onChange={(e) => setSettings({ ...settings, autoHideEmptySmartLists: e.target.checked })} /><span className="ms-toggle-slider" /></label></div><div className="ms-setting-item"><label>Show 'Due Today' tasks in My Day</label><label className="ms-toggle"><input type="checkbox" checked={settings.showDueTodayInMyDay} onChange={(e) => setSettings({ ...settings, showDueTodayInMyDay: e.target.checked })} /><span className="ms-toggle-slider" /></label></div></div></div></div>{showPrintModal && <div className="ms-modal-overlay"><div className="ms-print-modal"><div className="ms-print-modal-header"><h3>Print options</h3><button className="ms-print-modal-close" onClick={() => setShowPrintModal(false)}><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L13 13M1 13L13 1" /></svg></button></div><div className="ms-print-modal-body"><div className="ms-print-toggle-row"><span>Print steps</span><div className="ms-toggle-switch" onClick={() => setPrintSteps(!printSteps)}><div className={`ms-toggle-track ${printSteps ? "on" : "off"}`}><div className="ms-toggle-thumb" /></div><span className="ms-toggle-label">{printSteps ? "On" : "Off"}</span></div></div><div className="ms-print-toggle-row"><span>Print notes</span><div className="ms-toggle-switch" onClick={() => setPrintNotes(!printNotes)}><div className={`ms-toggle-track ${printNotes ? "on" : "off"}`}><div className="ms-toggle-thumb" /></div><span className="ms-toggle-label">{printNotes ? "On" : "Off"}</span></div></div></div><div className="ms-print-modal-footer"><button className="ms-print-btn-primary" onClick={handlePrint}>Print</button></div></div></div>}</>;
}
