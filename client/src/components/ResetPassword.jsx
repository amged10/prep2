import React, { useEffect, useState } from 'react';

import { useI18n } from '../i18n';
import { useUI } from '../ui/index.jsx';

export default function ResetPassword({ initialToken = '' }) {
  const { t } = useI18n();
  const [token, setToken] = useState(initialToken || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialToken) setToken(initialToken);
  }, [initialToken]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
        showToast(t('reset_success') || 'Password reset successful — please login', 'success');
    } catch (err) {
        showToast(err.message || t('failed'), 'error');
    } finally { setLoading(false); }
  }

    const { showToast } = useUI();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">{t('reset_password')}</h4>
      <form onSubmit={submit} className="space-y-2">
  <input className="w-full border p-2" placeholder={t('reset_token_placeholder')} value={token} onChange={e=>setToken(e.target.value)} />
        <input className="w-full border p-2" placeholder={t('password_placeholder')} type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-indigo-600 text-white px-3 py-1 rounded" disabled={loading}>{loading ? t('saving') : t('reset_password')}</button>
      </form>
    </div>
  );
}
