import { useState } from 'react';
import { login, signup, saveSession } from '../api';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import AnoAI from './ui/animated-shader-background';

export default function AuthPage({ onLogin }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggle() {
    setIsSignIn((v) => !v);
    setError('');
    setName(''); setEmail(''); setPassword(''); setConfirm('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isSignIn && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = isSignIn
        ? await login(email.trim(), password)
        : await signup(name.trim(), email.trim(), password);
      saveSession(res.token, res.user);
      onLogin(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <AnoAI />
      <div className="auth-split-container">
        
        {/* Left Side: Branding / Hero */}
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="auth-logo-large">
              <CheckCircle2 size={36} className="auth-logo-icon-large" />
              <span>TaskFlow</span>
            </div>
            <h2 className="auth-hero-title">Organize your work and life, finally.</h2>
            <p className="auth-hero-subtitle">
              Become focused, organized, and calm with TaskFlow. The world's most elegant task manager.
            </p>
            <div className="auth-hero-features">
              <div className="auth-feature"><CheckCircle2 size={20} /> <span>Sync across all devices in real-time</span></div>
              <div className="auth-feature"><CheckCircle2 size={20} /> <span>Organize with smart lists & groups</span></div>
              <div className="auth-feature"><CheckCircle2 size={20} /> <span>Never miss a deadline again</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-form-container">
          <h1 className="auth-heading">{isSignIn ? 'Welcome back' : 'Create account'}</h1>
          <p className="auth-sub">
            {isSignIn
              ? 'Sign in to access your tasks'
              : 'Sign up to start organising your day'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="on">
            {!isSignIn && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">Full name</label>
                <div className="input-with-icon">
                  <UserIcon size={18} className="input-icon" />
                  <input
                    id="auth-name"
                    className="form-input"
                    type="text"
                    placeholder="Jane Smith"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="auth-email"
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="auth-password"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isSignIn && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm">Confirm password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="auth-confirm"
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? (isSignIn ? 'Signing in…' : 'Creating account…') : (isSignIn ? 'Sign In' : 'Sign Up')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-toggle">
            {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" onClick={toggle}>
              {isSignIn ? 'Create one now' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
