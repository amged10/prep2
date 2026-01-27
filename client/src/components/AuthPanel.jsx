import React, { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import ResetPasswordCode from './ResetPasswordCode';
import { useI18n } from '../i18n.jsx';

export default function AuthPanel({ onAuth }) {
  const { t, lang } = useI18n();
  const [reg, setReg] = useState({ username: '', email: '', password: '' });
  const [login, setLogin] = useState({ identifier: '', password: '' });
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  async function submitRegister(e) {
    e.preventDefault();
    setLoadingReg(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reg)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطأ في التسجيل');
      onAuth(data.user, data.token);
    } catch (err) {
      alert(err.message || 'فشل');
    } finally { setLoadingReg(false); }
  }

  async function submitLogin(e) {
    e.preventDefault();
    setLoadingLogin(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل تسجيل الدخول');
      onAuth(data.user, data.token);
    } catch (err) {
      alert(err.message || 'فشل');
    } finally { setLoadingLogin(false); }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 neon-flow -z-10" aria-hidden></div>

  <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration (left) - green */}
        <div className="glass-card neon-border-green p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 accent-green">{t('create_account')}</h2>
            <p className="text-sm muted mb-6">{t('join_community')}</p>

            <form onSubmit={submitRegister} className="space-y-4">
              <input required value={reg.username} onChange={e=>setReg({...reg, username: e.target.value})} placeholder={t('login_placeholder_id')} className="input-rounded" />
              <input required value={reg.email} onChange={e=>setReg({...reg, email: e.target.value})} placeholder={t('email_placeholder')} className="input-rounded" />
              <input required value={reg.password} onChange={e=>setReg({...reg, password: e.target.value})} type="password" placeholder={t('password_placeholder')} className="input-rounded" />
              <button type="submit" disabled={loadingReg} className="btn-primary">{loadingReg ? t('sending') : t('register_button')}</button>
            </form>
          </div>
          <div className="text-xs text-green-200/60 mt-6">{t('community_terms')}</div>
        </div>

        {/* Login (right) - purple/indigo */}
        <div className="glass-card neon-border-purple p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 accent-purple">{t('login_title')}</h2>
            <p className="text-sm muted mb-6">{t('welcome_back')}</p>

            <form onSubmit={submitLogin} className="space-y-4">
              <input required value={login.identifier} onChange={e=>setLogin({...login, identifier: e.target.value})} placeholder={t('login_placeholder_id')} className="input-rounded" />
              <input required value={login.password} onChange={e=>setLogin({...login, password: e.target.value})} type="password" placeholder={t('password_placeholder')} className="input-rounded" />
              <button type="submit" disabled={loadingLogin} className="btn-secondary">{loadingLogin ? t('sending') : t('login_button')}</button>
            </form>
          </div>
          <div className="text-xs muted mt-6">
            {!showForgot ? (
              <button onClick={() => setShowForgot(true)} className="text-sm text-indigo-700 underline" aria-label="Forgot password">{t('forgot_password_link')}</button>
            ) : (
              <div className="mt-3">
                <ForgotPassword onTokenSent={(tok, email) => { setResetToken(tok); setResetEmail(email || ''); setShowForgot(false); setShowReset(true); }} />
                <div className="mt-2">
                  <button onClick={() => { setShowForgot(false); if (resetToken) setShowReset(true); }} className="text-sm text-gray-600 underline">{t('close')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Reset password panel appears when a token is present or requested */}
        {showReset && (
          <div className="col-span-1 md:col-span-2 mt-4">
            {/* Prefer code flow UI; keep legacy token reset for compatibility */}
            <ResetPasswordCode initialCode={resetToken} initialEmail={resetEmail} />
            <div className="mt-2 text-right">
              <button onClick={() => { setShowReset(false); setResetToken(''); setResetEmail(''); }} className="text-sm text-gray-600 underline">{t('close')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
