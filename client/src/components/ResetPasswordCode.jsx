import React, { useEffect, useState } from 'react';

import { useI18n } from '../i18n.jsx';
import { useUI } from '../ui/index.jsx';

export default function ResetPasswordCode({ initialCode = '', initialEmail = '' }) {
  const { t } = useI18n();
  const [email, setEmail] = useState(initialEmail || '');
  const [code, setCode] = useState(initialCode || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useUI();

  useEffect(() => { if (initialCode) setCode(initialCode); if (initialEmail) setEmail(initialEmail); }, [initialCode, initialEmail]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      showToast(t('reset_success') || 'Password reset successful — please login', 'success');
    } catch (err) {
      showToast(err.message || t('failed'), 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">{t('reset_password')}</h4>
      <form onSubmit={submit} className="space-y-2">
        <input className="w-full border p-2" placeholder={t('email_placeholder')} value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2" placeholder={t('reset_token_placeholder')} value={code} onChange={e=>setCode(e.target.value)} />
        <input className="w-full border p-2" placeholder={t('password_placeholder')} type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-indigo-600 text-white px-3 py-1 rounded" disabled={loading}>{loading ? t('saving') : t('reset_password')}</button>
      </form>
    </div>
  );
}
