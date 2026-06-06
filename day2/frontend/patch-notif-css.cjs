const fs = require('fs');

const css = `
/* ── Notifications Right Panel ──────────────────────────────────────────── */
.ms-right-panel {
  position: fixed;
  top: 48px; /* Below top bar */
  right: -360px; /* Hide offscreen */
  width: 360px;
  height: calc(100vh - 48px);
  background: #ffffff;
  border-left: 1px solid var(--ms-border);
  box-shadow: -4px 0 24px rgba(0,0,0,0.1);
  z-index: 900;
  display: flex;
  flex-direction: column;
  transition: right 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.ms-right-panel.open {
  right: 0;
}

.ms-right-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}
.ms-right-panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--ms-text);
  margin: 0;
}
.ms-right-panel-close {
  background: none;
  border: 1px solid var(--ms-border);
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ms-text);
}
.ms-right-panel-close:hover {
  background: var(--ms-hover);
}

.ms-right-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ms-notif-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ms-text-muted);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ms-notif-empty {
  font-size: 14px;
  color: var(--ms-text-muted);
  text-align: center;
  padding: 24px 0;
}

.ms-notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ms-notif-item {
  padding: 12px;
  background: var(--ms-hover);
  border-radius: 4px;
}
.ms-notif-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ms-text);
  margin-bottom: 4px;
}
.ms-notif-time {
  font-size: 12px;
  color: var(--ms-text-muted);
}

/* What's New Cards */
.ms-whatsnew-card {
  background: #ffffff;
  border: 1px solid var(--ms-border);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.ms-whatsnew-image {
  background: #e6f2ff; /* Light blue */
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255,255,255,0.4) 0px,
    rgba(255,255,255,0.4) 2px,
    transparent 2px,
    transparent 10px
  );
}

/* CSS Drawn Dark Mode UI */
.ms-fake-window-bg {
  width: 240px;
  height: 140px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: absolute;
  top: 20px;
  left: 20px;
  border-top: 16px solid #e0e0e0;
}
.ms-fake-window-fg {
  width: 240px;
  height: 140px;
  background: #1e1e1e;
  border-radius: 6px;
  box-shadow: -10px 10px 20px rgba(0,0,0,0.2);
  position: absolute;
  top: 40px;
  right: 20px;
  border-top: 16px solid #2d2d2d;
  display: flex;
  padding: 10px;
  gap: 10px;
}
.ms-fake-window-fg::before {
  content: '';
  width: 40px;
  height: 80px;
  background: #333;
  border-radius: 4px;
}
.ms-fake-window-fg::after {
  content: '';
  flex: 1;
  height: 40px;
  background: #444;
  border-radius: 4px;
}

/* CSS Drawn Resize details UI */
.ms-whatsnew-resize .ms-fake-window-panel {
  width: 220px;
  height: 130px;
  background: #ffffff;
  border-top: 16px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: absolute;
  top: 30px;
  left: 30px;
}
.ms-whatsnew-resize .ms-fake-window-panel.small {
  width: 140px;
  left: 140px;
  box-shadow: -8px 4px 12px rgba(0,0,0,0.15);
}
.ms-resize-icon {
  position: absolute;
  background: #ffffff;
  color: var(--ms-blue);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 10;
}

/* Stars */
.ms-star {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #0078d4;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.ms-star-1 { top: 30px; right: 40px; background: #ffb900; }
.ms-star-2 { bottom: 30px; left: 40px; }
.ms-star-3 { top: 50px; right: 20px; transform: scale(0.6); }

.ms-whatsnew-content {
  padding: 16px;
}
.ms-whatsnew-content p {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: var(--ms-text);
  line-height: 1.4;
}
.ms-whatsnew-btn {
  background: #ffffff;
  border: 1px solid var(--ms-border);
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ms-text);
  cursor: pointer;
}
.ms-whatsnew-btn:hover {
  background: var(--ms-hover);
}

@media print {
  .ms-right-panel {
    display: none !important;
  }
}
`;

fs.appendFileSync('c:/Users/sohaa/Downloads/intranship projects/day2/frontend/src/index.css', css, 'utf8');
console.log('Appended CSS to index.css');
