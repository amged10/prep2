import React, { useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { useUI } from '../ui/index.jsx';

export default function Login({ onAuth }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
  if (!res.ok) throw new Error(data.message || t('login_failed'));
      onAuth(data.user, data.token);
    } catch (err) {
      showToast(err.message || t('login_failed'), 'error');
    } finally {
      setLoading(false);
    }
  }

  const { t } = useI18n();
  const { showToast } = useUI();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      {!showForgot ? (
        <form onSubmit={submit} className="space-y-4">
          <h3 className="text-2xl font-bold mb-2">{t('login_welcome')}</h3>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder={t('login_placeholder_id')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder={t('login_placeholder_pw')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <button className="bg-indigo-600 text-white py-2 px-4 rounded" disabled={loading}>
              {loading ? t('logging_in') : t('login_button')}
            </button>
            <button type="button" className="text-sm text-indigo-600" onClick={() => setShowForgot(true)}>{t('forgot_password')}</button>
          </div>
        </form>
      ) : (
        <div>
            <button type="button" className="text-sm text-gray-500 mb-3" onClick={() => setShowForgot(false)}>{t('back_to_login')}</button>
          <div>
            {/* ForgotPassword component will be rendered via dynamic import in parent App if needed; fallback prompt here */}
              <p className="text-sm">{t('forgot_fallback')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
