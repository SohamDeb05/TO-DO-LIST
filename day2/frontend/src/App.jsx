import { useState } from 'react';
import AuthPage from './components/AuthPage';
import TodoPage from './components/TodoPage';
import { clearSession, loadSession } from './api';

export default function App() {
  const [user, setUser] = useState(() => {
    return loadSession()?.user ?? null;
  });

  function handleLogin(u) {
    setUser(u);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  if (user) {
    return <TodoPage user={user} onLogout={handleLogout} onUpdateUser={setUser} />;
  }

  return <AuthPage onLogin={handleLogin} />;
}
