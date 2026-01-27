import React, { useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { useUI } from '../ui/index.jsx';

export default function Register({ onAuth }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useI18n();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
  if (!res.ok) throw new Error(data.message || t('registration_failed'));
      onAuth(data.user, data.token);
    } catch (err) {
      showToast(err.message || t('registration_failed'), 'error');
    }
  }

  const { showToast } = useUI();

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">{t('register_title')}</h3>
      <input
        className="w-full border rounded px-2 py-1 mb-2"
        placeholder={t('login_placeholder_id')}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        minLength={3}
      />
      <input
        className="w-full border rounded px-2 py-1 mb-2"
        placeholder={t('email_placeholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border rounded px-2 py-1 mb-2"
        placeholder={t('password_placeholder')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-green-600 text-white py-2 rounded">
        {t('register_button')}
      </button>
    </form>
  );
}
