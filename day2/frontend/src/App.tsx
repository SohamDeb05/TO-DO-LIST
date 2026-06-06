import { useState } from 'react';
import AuthPage from './components/AuthPage';
import TodoPage from './components/TodoPage';
import { clearSession, loadSession, type User } from './api';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    return loadSession()?.user ?? null;
  });

  function handleLogin(u: User) {
    setUser(u);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  if (user) {
    return <TodoPage user={user} onLogout={handleLogout} />;
  }

  return <AuthPage onLogin={handleLogin} />;
}
