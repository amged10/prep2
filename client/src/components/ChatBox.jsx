import React, { useEffect, useState, useRef } from 'react';
import { getSocket } from '../socket';
import { useI18n } from '../i18n.jsx';
import { useUI } from '../ui/index.jsx';

export default function ChatBox({ user }) {
  const { t } = useI18n();
  const { showToast } = useUI();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const messagesRef = useRef(null);
  const pendingRef = useRef({});

  const colorMapRef = useRef({});

  // deterministic unique color per username (unique among visible users)
  function hashStringToInt(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = str.charCodeAt(i) + ((h << 5) - h);
      h = h & h; // convert to 32bit integer
    }
    return Math.abs(h);
  }

  function generateColorForName(name) {
    const base = hashStringToInt(name);
    let hue = base % 360;
    const saturation = 65;
    const lightness = 45;

    // Avoid duplicates among currently assigned colors
    const used = new Set(Object.values(colorMapRef.current));
    let color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const step = 47; // prime step to spread probes
    while (used.has(color)) {
      hue = (hue + step) % 360;
      color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    colorMapRef.current[name] = color;
    return color;
  }

  function nameToColor(name) {
    if (!name) return '#374151'; // gray fallback
    if (colorMapRef.current[name]) return colorMapRef.current[name];
    return generateColorForName(name);
  }

  useEffect(() => {
    // load recent messages
    async function loadMessages() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/messages/recent`);
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    }
    loadMessages();

    const socket = getSocket();
    if (!socket) {
      console.warn('Socket not initialized for ChatBox');
      return;
    }

    const onNew = (msg) => {
      // If we have a pending message with same content and senderName, replace it
      setMessages((prev) => {
        const idx = prev.findIndex(m => m.pending && m.senderName === msg.senderName && m.content === msg.content);
        if (idx !== -1) {
          const copy = [...prev];
          copy.splice(idx, 1, msg);
          return copy;
        }
        return [...prev, msg];
      });
      scrollToBottom();
    };

    socket.on('new_message', onNew);

    return () => {
      socket.off('new_message', onNew);
    };
  }, []);

  // keep color mapping for visible users up-to-date
  useEffect(() => {
    const names = Array.from(new Set(messages.map(m => m.senderName).filter(Boolean)));
    names.forEach((n) => {
      if (!colorMapRef.current[n]) generateColorForName(n);
    });
  }, [messages]);

  function scrollToBottom() {
    setTimeout(() => {
      messagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  }

  const send = (e) => {
    e.preventDefault();
    const content = value.trim();
    if (!content) return;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      showToast(t('not_connected'), 'error');
      return;
    }
    // optimistic UI: add a pending message immediately
    const tempId = `local-${Date.now()}`;
    const tempMsg = { _id: tempId, content, senderName: user.username, createdAt: new Date().toISOString(), pending: true };
    setMessages(prev => [...prev, tempMsg]);
    pendingRef.current[tempId] = tempMsg;

    socket.emit('send_message', { content });
    setValue('');
  };

  return (
    <div className="bg-white rounded shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">{t('chat_title')}</h2>

      <div className="border rounded p-3 h-96 overflow-y-auto bg-gray-50">
        {messages.map((m) => {
          const isMe = m.senderName === user.username;
          return (
            <div key={m._id} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col max-w-[80%]">
                    <div className={`text-xs ${isMe ? 'text-right' : 'text-left'}`} style={{ color: nameToColor(m.senderName) }}>
                      <span className="inline-block w-2 h-2 rounded-full align-middle mr-2" style={{ backgroundColor: nameToColor(m.senderName) }} aria-hidden />
                      <span className="align-middle">{m.senderName}</span>
                    </div>
                    <div className={`inline-block px-3 py-2 rounded-md ${isMe ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-gray-800'}`}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('chat_placeholder')}
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          {t('send')}
        </button>
      </form>
    </div>
  );
}
