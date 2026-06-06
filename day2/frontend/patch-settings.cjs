const fs = require('fs');
const path = require('path');

const file = 'c:/Users/sohaa/Downloads/intranship projects/day2/frontend/src/components/TodoPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace(
  /import \{ User, Todo, List, ListGroup, getTodos, createTodo, updateTodo, deleteTodo, getLists, createList, updateList, deleteList, getGroups, createGroup, updateGroup, deleteGroup \} from '\.\.\/api';/,
  `import { User, Todo, List, ListGroup, getTodos, createTodo, updateTodo, deleteTodo, getLists, createList, updateList, deleteList, getGroups, createGroup, updateGroup, deleteGroup, AppSettings, loadAppSettings, saveAppSettings } from '../api';`
);

// 2. Add settings states
content = content.replace(
  /const \[showNotifications, setShowNotifications\] = useState\(false\);\n  const notificationsRef = useRef<HTMLDivElement>\(null\);/,
  `const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings());
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);`
);

// 3. Update settings state and effect
content = content.replace(
  /      if \(notificationsRef\.current && !notificationsRef\.current\.contains\(e\.target as Node\)\) setShowNotifications\(false\);/,
  `      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);`
);

content = content.replace(
  /  useEffect\(\(\) => \{\n    if \(editing\) inputRef\.current\?\.focus\(\);\n  \}, \[editing\]\);/,
  `  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (settings.darkMode) document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
    saveAppSettings(settings);
  }, [settings]);`
);

// 4. Hook up top bar settings button
content = content.replace(
  /<button className="top-bar-btn-icon" title="Settings"><Settings size=\{S\} \/><\/button>/,
  `<button className="top-bar-btn-icon" title="Settings" onClick={() => setShowSettings(!showSettings)}><Settings size={S} /></button>`
);

// 5. Update deletion logic
content = content.replace(
  /  async function handleDelete\(id: number\) \{\n    try \{\n      await deleteTodo\(id\);/,
  `  async function handleDelete(id: number) {
    if (settings.confirmBeforeDeleting && !window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTodo(id);`
);

content = content.replace(
  /  async function handleDeleteList\(id: number\) \{\n    try \{\n      await deleteList\(id\);/,
  `  async function handleDeleteList(id: number) {
    if (settings.confirmBeforeDeleting && !window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await deleteList(id);`
);

// 6. Update toggle for completion sound
content = content.replace(
  /    const updated = \{ \.\.\.todo, completed: !todo\.completed \};/,
  `    const updated = { ...todo, completed: !todo.completed };
    if (!todo.completed && settings.playCompletionSound) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.1);
      } catch(e) {}
    }`
);

// 7. Update getFilteredAndSortedTodos for sorting
content = content.replace(
  /    \/\/ 2\. Sorting\n    if \(sortBy === 'title'\) \{/,
  `    // 2. Sorting
    if (sortBy === 'default') {
      if (settings.moveStarredToTop) {
        result.sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
      }
      if (settings.addNewTasksOnTop) {
        // Reverse stable sort for default
        result.sort((a, b) => {
          if (a.important === b.important) {
             return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });
      }
    } else if (sortBy === 'title') {`
);

// 8. Update NAV mapping
content = content.replace(
  /\{NAV\.map\(\(\{ icon, label, id \}\) => \(/,
  `{NAV.filter(item => {
                if (item.id === 'important') return settings.smartListImportant;
                if (item.id === 'planned') return settings.smartListPlanned;
                if (item.id === 'assigned') return settings.smartListAssigned;
                if (item.id === 'all') return settings.smartListAll;
                if (item.id === 'completed') return settings.smartListCompleted;
                return true;
              }).map(({ icon, label, id }) => (`
);

// 9. Add Settings Panel DOM
const settingsPanelDOM = `
      {/* Settings Right Panel */}
      <div className={\`ms-right-panel \${showSettings ? 'open' : ''}\`} ref={settingsRef}>
        <div className="ms-right-panel-header">
          <h2>Settings</h2>
          <button className="ms-right-panel-close" onClick={() => setShowSettings(false)}>
            <X size={16} />
          </button>
        </div>
        
        <div className="ms-right-panel-body">
          <div className="ms-settings-section">
            <h3 className="ms-settings-section-title">General</h3>
            
            <div className="ms-setting-item">
              <label>Confirm before deleting</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.confirmBeforeDeleting} onChange={e => setSettings({...settings, confirmBeforeDeleting: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Add new tasks on top</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.addNewTasksOnTop} onChange={e => setSettings({...settings, addNewTasksOnTop: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Move starred tasks to top</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.moveStarredToTop} onChange={e => setSettings({...settings, moveStarredToTop: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Play completion sound</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.playCompletionSound} onChange={e => setSettings({...settings, playCompletionSound: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Show right-click menus</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.showRightClickMenus} onChange={e => setSettings({...settings, showRightClickMenus: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Turn on reminder notifications</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.reminderNotifications} onChange={e => setSettings({...settings, reminderNotifications: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Turn on dark mode</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.darkMode} onChange={e => setSettings({...settings, darkMode: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>
          </div>

          <div className="ms-settings-section">
            <h3 className="ms-settings-section-title">Smart lists</h3>
            
            <div className="ms-setting-item">
              <label>Important</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.smartListImportant} onChange={e => setSettings({...settings, smartListImportant: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Planned</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.smartListPlanned} onChange={e => setSettings({...settings, smartListPlanned: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>All</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.smartListAll} onChange={e => setSettings({...settings, smartListAll: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Completed</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.smartListCompleted} onChange={e => setSettings({...settings, smartListCompleted: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Assigned to me</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.smartListAssigned} onChange={e => setSettings({...settings, smartListAssigned: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Auto-hide empty smart lists</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.autoHideEmptySmartLists} onChange={e => setSettings({...settings, autoHideEmptySmartLists: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

            <div className="ms-setting-item">
              <label>Show 'Due Today' tasks in My Day</label>
              <div className="ms-toggle">
                <input type="checkbox" checked={settings.showDueTodayInMyDay} onChange={e => setSettings({...settings, showDueTodayInMyDay: e.target.checked})} />
                <span className="ms-toggle-slider"></span>
              </div>
            </div>

          </div>
        </div>
      </div>
`;

content = content.replace(
  /      \{showPrintModal && \(/,
  settingsPanelDOM + '\n      {showPrintModal && ('
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched TodoPage.tsx for Settings Panel');
