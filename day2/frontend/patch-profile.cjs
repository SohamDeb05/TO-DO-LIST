const fs = require('fs');
const path = require('path');

const file = 'c:/Users/sohaa/Downloads/intranship projects/day2/frontend/src/components/TodoPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states for profile menu
content = content.replace(
  /const \[showPrintModal, setShowPrintModal\] = useState\(false\);/,
  `const [showPrintModal, setShowPrintModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);`
);

// 2. Add profileMenuRef to handleClickOutside
content = content.replace(
  /if \(listOptionsRef\.current && !listOptionsRef\.current\.contains\(e\.target as Node\)\) setShowListOptions\(false\);/,
  `if (listOptionsRef.current && !listOptionsRef.current.contains(e.target as Node)) setShowListOptions(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setShowProfileMenu(false);`
);

// 3. Update the avatar section in top-bar
content = content.replace(
  /<div\n\s*className="top-bar-avatar"\n\s*title=\{`\$\{user\.name\} — click to log out`\}\n\s*onClick=\{onLogout\}\n\s*>\n\s*\{initials\(user\.name\)\}\n\s*<\/div>/,
  `<div className="top-bar-profile-container" ref={profileMenuRef}>
              <div
                className="top-bar-avatar"
                title={user.name}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {initials(user.name)}
              </div>
              {showProfileMenu && (
                <div className="ms-profile-popover">
                  <div className="ms-profile-header">
                    <div className="ms-profile-logo">
                      <div className="ms-logo-squares">
                        <div className="ms-sq" style={{background: '#f25022'}}></div>
                        <div className="ms-sq" style={{background: '#7fba00'}}></div>
                        <div className="ms-sq" style={{background: '#00a4ef'}}></div>
                        <div className="ms-sq" style={{background: '#ffb900'}}></div>
                      </div>
                      <span className="ms-logo-text">Microsoft</span>
                    </div>
                    <button className="ms-profile-signout" onClick={onLogout}>Sign out</button>
                  </div>
                  <div className="ms-profile-body">
                    <div className="ms-profile-avatar-large">
                      {initials(user.name)}
                    </div>
                    <div className="ms-profile-info">
                      <div className="ms-profile-name">{user.name}</div>
                      <div className="ms-profile-email">{user.email}</div>
                      <a href="#" className="ms-profile-link" onClick={e => e.preventDefault()}>My Microsoft account</a>
                      <a href="#" className="ms-profile-link" onClick={e => e.preventDefault()}>My profile</a>
                    </div>
                  </div>
                </div>
              )}
            </div>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched TodoPage.tsx for Profile Menu');
