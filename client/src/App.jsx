import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import ChatBox from './components/ChatBox';
// replaced separate Login/Register with a single stylish AuthPanel
import AuthPanel from './components/AuthPanel';
// Resources feature removed
import { initSocket, disconnectSocket, getSocket } from './socket';
import HealthCheck from './components/HealthCheck';
import I18nTest from './pages/I18nTest';

const STORAGE_KEY = 'prep2_auth';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('prep2_token') || null);

  useEffect(() => {
    if (user && token) {
      const s = initSocket(token);
      s.on('connect', () => console.log('socket connected', s.id));
      s.on('connect_error', (err) => console.error('Socket connect error', err.message));
      return () => {
        disconnectSocket();
      };
    }
    return;
  }, [user, token]);

  const handleLogin = (userObj, jwt) => {
    setUser(userObj);
    setToken(jwt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    localStorage.setItem('prep2_token', jwt);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('prep2_token');
    disconnectSocket();
  };

  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar user={user} token={token} onLogout={handleLogout} />
      <HealthCheck user={user} token={token} />
      {/* show i18n QA page when ?i18n=1 */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('i18n') === '1' && (
        <main className="max-w-6xl mx-auto p-4">
          <I18nTest />
        </main>
      )}
      {! (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('i18n') === '1') && (
      <main className="max-w-4xl mx-auto p-4">
        {!user ? (
          <AuthPanel onAuth={handleLogin} />
        ) : (
          <>
            <ChatBox user={user} token={token} />
            {/* Resources section removed per request */}
          </>
        )}
        </main>
      )}
    </div>
  );
}
