import React, { useState } from 'react';

import { useI18n } from '../i18n.jsx';
import { useUI } from '../ui/index.jsx';

export default function ForgotPassword({ onTokenSent }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [sentToken, setSentToken] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/forgot`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      // For demo we show token (in prod you'd email it)
  setSentToken(data.token || data.code || null);
  // server now returns `code` in non-production; accept both `token` and `code` for compatibility
  const theCode = data.code || data.token;
  if (onTokenSent) onTokenSent(theCode, email);
    } catch (err) {
      showToast(err.message || t('sending'), 'error');
    } finally { setLoading(false); }
  }

  const { showToast } = useUI();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">{t('forgot_password')}</h4>
      <form onSubmit={submit} className="space-y-2">
        <input className="w-full border p-2" placeholder={t('email_placeholder')} value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="bg-indigo-600 text-white px-3 py-1 rounded" disabled={loading}>{loading ? t('sending') : t('send_reset_token')}</button>
      </form>
      {sentToken && (
        <div className="mt-3 p-2 bg-green-50 border rounded">
          <div className="text-sm">{t('demo_token_text')}</div>
          <div className="font-mono text-xs break-all">{sentToken}</div>
        </div>
      )}
    </div>
  );
}
