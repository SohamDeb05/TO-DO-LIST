interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

const features = [
  {
    icon: '✅',
    title: 'One place for all your tasks',
    desc: 'Capture and organise everything — personal or work — in a single, beautiful list.',
  },
  {
    icon: '🔒',
    title: 'Your tasks, only yours',
    desc: 'Every task is tied to your account. Sign in from anywhere and pick up right where you left off.',
  },
  {
    icon: '⚡',
    title: 'Fast & distraction-free',
    desc: 'Add tasks with a keystroke, check them off, and track your progress with a live progress bar.',
  },
];

export default function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
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
              <div className="modal-feature-icon">{f.icon}</div>
              <div>
                <p className="modal-feature-title">{f.title}</p>
                <p className="modal-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button id="welcome-lets-go" className="modal-cta" onClick={onClose}>
          Let's go! 🚀
        </button>
      </div>
    </div>
  );
}
