import React from 'react';
import { useI18n } from '../i18n.jsx';
import { useUI } from '../ui/index.jsx';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Navbar({ user, token, onLogout }) {
  const { t, lang, setLang } = useI18n();
  const { showToast } = useUI();

  return (
    <nav className="relative z-30 bg-gradient-to-r from-indigo-500 to-pink-500 text-white p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">{t('title')}</div>
        <div className="flex items-center gap-4">
          <div className="mr-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm">{t('hi')}, <strong>{user.username}</strong></div>
                <button
                  onClick={onLogout}
                  className="bg-white/10 px-3 py-1 rounded hover:bg-white/20 text-sm text-white"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="text-sm">{t('please_sign_in')}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={async (e) => {
                const newLang = e.target.value;
                setLang(newLang);
                // persist to server if logged in
                if (token) {
                  try {
                    const res = await fetch(`${BACKEND}/api/auth/lang`, {
                      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ language: newLang })
                    });
                    if (!res.ok) throw new Error('Failed');
                    showToast(t('language_saved'), 'success');
                  } catch (err) {
                    showToast(err.message || 'Failed to save language', 'error');
                  }
                }
              }}
              className="text-sm rounded bg-white px-2 py-1 text-black font-semibold"
              aria-label="Language"
            >
              <option value="en" className="text-black">EN</option>
              <option value="ar" className="text-black">العربية</option>
            </select>

            {/* i18n QA button removed */}
          </div>
        </div>
      </div>
    </nav>
  );
}
