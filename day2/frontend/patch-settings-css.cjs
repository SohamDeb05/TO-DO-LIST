const fs = require('fs');

const css = `
/* ── Settings Panel ─────────────────────────────────────────────────────── */
.ms-settings-section {
  margin-bottom: 32px;
}
.ms-settings-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ms-text);
  margin: 0 0 16px 0;
}
.ms-setting-item {
  margin-bottom: 20px;
}
.ms-setting-item label {
  display: block;
  font-size: 14px;
  color: var(--ms-text);
  margin-bottom: 8px;
}
.ms-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.ms-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.ms-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #e0e0e0;
  transition: .2s;
  border-radius: 24px;
  border: 1px solid #737373;
}
.ms-toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: #5c5c5c;
  transition: .2s;
  border-radius: 50%;
}
.ms-toggle input:checked + .ms-toggle-slider {
  background-color: var(--ms-blue);
  border-color: var(--ms-blue);
}
.ms-toggle input:checked + .ms-toggle-slider:before {
  transform: translateX(20px);
  background-color: white;
}
.ms-toggle::after {
  content: "Off";
  position: absolute;
  left: 52px;
  top: 3px;
  font-size: 13px;
  color: var(--ms-text);
  pointer-events: none;
}
.ms-toggle:has(input:checked)::after {
  content: "On";
}

/* ── Dark Theme Variables ───────────────────────────────────────────────── */
body.dark-theme {
  --ms-blue: #3a96ff;
  --ms-blue-light: #1c365d;
  --ms-blue-dark: #6eb1ff;
  --ms-blue-bg: #0f172a;
  
  --ms-bg: #111111;
  --ms-bg-secondary: #1a1a1a;
  --ms-border: #333333;
  --ms-hover: #222222;
  
  --ms-text: #ffffff;
  --ms-text-muted: #a0a0a0;
  --ms-text-placeholder: #555555;
  
  --ms-item-bg: #1e1e1e;
  --ms-item-hover: #2a2a2a;
  --ms-item-border: #333333;
  
  background-color: var(--ms-bg);
  color: var(--ms-text);
}

body.dark-theme .top-bar {
  background-color: var(--ms-bg);
  border-bottom: 1px solid var(--ms-border);
}

body.dark-theme .ms-logo-text {
  color: #fff;
}

body.dark-theme .ms-search input {
  background-color: var(--ms-bg-secondary);
  color: var(--ms-text);
}

body.dark-theme .ms-right-panel,
body.dark-theme .ms-profile-popover,
body.dark-theme .ms-dropdown-menu,
body.dark-theme .ms-popover-panel,
body.dark-theme .ms-date-popover {
  background-color: var(--ms-bg);
  border-color: var(--ms-border);
}

body.dark-theme .ms-whatsnew-card {
  background-color: var(--ms-item-bg);
  border-color: var(--ms-border);
}

body.dark-theme .ms-task-item {
  background: var(--ms-item-bg);
}
`;

fs.appendFileSync('c:/Users/sohaa/Downloads/intranship projects/day2/frontend/src/index.css', css, 'utf8');
console.log('Appended Settings and Dark Mode CSS to index.css');
