import { CheckSquare, Lock, Zap, Rocket } from 'lucide-react';

const features = [
  {
    icon: <CheckSquare size={22} color="#107c41" />,
    bg: '#eaf6ea',
    title: 'One place for all your tasks',
    desc: 'Capture and organise everything — personal or work — in a single, beautiful list.',
  },
  {
    icon: <Lock size={22} color="#d13438" />,
    bg: '#fdf3f4',
    title: 'Your tasks, only yours',
    desc: 'Every task is tied to your account. Sign in from anywhere and pick up right where you left off.',
  },
  {
    icon: <Zap size={22} color="#0078d4" />,
    bg: '#eff6fc',
    title: 'Fast & distraction-free',
    desc: 'Add tasks with a keystroke, check them off, and track your progress with a live progress bar.',
  },
];

export default function WelcomeModal({ userName, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="Close welcome">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-check-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <path d="M4 12.5l6 6L20 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 id="welcome-title" className="modal-title">
              Welcome to TaskFlow<span className="modal-title-accent">!</span>
            </h2>
            <p className="modal-subtitle">Hey {userName}, let's get you started 👋</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="modal-features">
          {features.map((f, i) => (
            <div key={i} className="modal-feature" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
              <div className="modal-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <div>
                <p className="modal-feature-title">{f.title}</p>
                <p className="modal-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button id="welcome-lets-go" className="modal-cta" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Let's go! <Rocket size={18} />
        </button>
      </div>
    </div>
  );
}
