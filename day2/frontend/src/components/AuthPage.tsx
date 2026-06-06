import { useState } from 'react';
import { login, signup, saveSession, type User } from '../api';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
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

  async function handleSubmit(e: React.FormEvent) {
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
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">✓</div>
          <span className="auth-logo-name">TaskFlow</span>
        </div>

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
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
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

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
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

          {!isSignIn && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm">Confirm password</label>
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
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? (isSignIn ? 'Signing in…' : 'Creating account…') : (isSignIn ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-toggle">
          {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={toggle}>
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
