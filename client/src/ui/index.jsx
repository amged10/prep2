import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { message, resolve }
  const okButtonRef = useRef(null);

  const showToast = useCallback((message, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    if (ttl > 0) setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), ttl);
    return id;
  }, []);

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = (ok) => {
    if (confirmState && confirmState.resolve) confirmState.resolve(ok);
    setConfirmState(null);
  };

  // keyboard shortcuts and modal focus management
  useEffect(() => {
    function onKey(e) {
      // Ctrl+K focuses first input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const inp = document.querySelector('input, textarea, [contenteditable="true"]');
        if (inp) {
          inp.focus();
          e.preventDefault();
        }
      }
      // Esc closes confirm
      if (e.key === 'Escape' && confirmState) {
        handleConfirm(false);
      }
      // Enter confirms when modal open
      if (e.key === 'Enter' && confirmState) {
        handleConfirm(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmState]);

  // focus OK button when modal opens
  useEffect(() => {
    if (confirmState) {
      setTimeout(() => okButtonRef.current?.focus(), 50);
    }
  }, [confirmState]);

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}
      {/* Toasts */}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2" aria-live="polite" aria-atomic="true">
        {toasts.map((it) => (
          <div key={it.id} role="status" className={`px-3 py-2 rounded shadow text-sm flex items-center gap-2 ${it.type === 'error' ? 'bg-red-600 text-white' : it.type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}`}>
            <span className="text-lg" aria-hidden>
              {it.type === 'error' ? '❌' : it.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span>{it.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Confirmation">
          <div className="bg-white p-4 rounded shadow max-w-sm w-full" tabIndex={-1}>
            <div className="mb-4 text-gray-800">{confirmState.message}</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => handleConfirm(false)}>Cancel</button>
              <button ref={okButtonRef} className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => handleConfirm(true)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}

export default UIProvider;
