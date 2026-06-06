const fs = require('fs');
const path = require('path');

const file = 'c:/Users/sohaa/Downloads/intranship projects/day2/frontend/src/components/TodoPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Megaphone and X to lucide imports if not there
if (!content.includes('Megaphone,')) {
  content = content.replace(/Bell,/, 'Bell, Megaphone, X,');
}

// 2. Add showNotifications state
content = content.replace(
  /const \[showProfileMenu, setShowProfileMenu\] = useState\(false\);\n  const profileMenuRef = useRef<HTMLDivElement>\(null\);/,
  `const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);`
);

// 3. Update handleClickOutside
content = content.replace(
  /if \(profileMenuRef\.current && !profileMenuRef\.current\.contains\(e\.target as Node\)\) setShowProfileMenu\(false\);/,
  `if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setShowProfileMenu(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setShowNotifications(false);`
);

// 4. Update the Bell icon to Megaphone and add onClick handler in top bar
content = content.replace(
  /<button className="top-bar-btn-icon" title="Notifications"><Bell size=\{S\} \/><\/button>/,
  `<button className="top-bar-btn-icon" title="What's new" onClick={() => setShowNotifications(!showNotifications)}>
              <Megaphone size={S} />
            </button>`
);

// 5. Add Reminders list calculation
content = content.replace(
  /const filteredTodos = getFilteredAndSortedTodos\(\);/,
  `const filteredTodos = getFilteredAndSortedTodos();
  
  const activeReminders = todos.filter(t => t.reminder && !t.completed);`
);

// 6. Append the notifications panel to the very end before </TodoPage> closing tags
content = content.replace(
  /      \{showPrintModal && \(/,
  `      {/* Notifications Right Panel */}
      <div className={\`ms-right-panel \${showNotifications ? 'open' : ''}\`} ref={notificationsRef}>
        <div className="ms-right-panel-header">
          <h2>What's new</h2>
          <button className="ms-right-panel-close" onClick={() => setShowNotifications(false)}>
            <X size={16} />
          </button>
        </div>
        
        <div className="ms-right-panel-body">
          <div className="ms-notif-section">
            <h3 className="ms-notif-section-title">Reminders</h3>
            {activeReminders.length === 0 ? (
              <div className="ms-notif-empty">No notifications</div>
            ) : (
              <div className="ms-notif-list">
                {activeReminders.map(r => (
                  <div key={r.id} className="ms-notif-item">
                    <div className="ms-notif-title">{r.title}</div>
                    <div className="ms-notif-time">{new Date(r.reminder!).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ms-notif-section">
            <h3 className="ms-notif-section-title">Updates</h3>
            
            {/* Dark Mode Card */}
            <div className="ms-whatsnew-card">
              <div className="ms-whatsnew-image">
                <div className="ms-fake-window-bg"></div>
                <div className="ms-fake-window-fg"></div>
                <div className="ms-star ms-star-1"></div>
                <div className="ms-star ms-star-2"></div>
                <div className="ms-star ms-star-3"></div>
              </div>
              <div className="ms-whatsnew-content">
                <p>Now you can change to Darkmode theme from settings!</p>
                <button className="ms-whatsnew-btn">Try it</button>
              </div>
            </div>

            {/* Resize Card */}
            <div className="ms-whatsnew-card">
              <div className="ms-whatsnew-image ms-whatsnew-resize">
                <div className="ms-fake-window-panel"></div>
                <div className="ms-fake-window-panel small"></div>
                <div className="ms-resize-icon">&harr;</div>
                <div className="ms-star ms-star-1"></div>
                <div className="ms-star ms-star-2"></div>
              </div>
              <div className="ms-whatsnew-content">
                <p>Now you can resize your details pane</p>
                <button className="ms-whatsnew-btn">Try it</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showPrintModal && (`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched TodoPage.tsx for Notifications Panel');
