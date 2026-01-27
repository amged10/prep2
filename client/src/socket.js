import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize socket with token.
 * @param {string} token - JWT token returned from the backend
 * @param {string} backendUrl - optional base url, default from env
 */
export function initSocket(token, backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000') {
  if (!token) throw new Error('Token required to init socket');
  // Ensure we have a concrete backend URL (use env, otherwise localhost:5000)
  const url = backendUrl || 'http://localhost:5000';
  socket = io(url, {
    auth: { token },
  });

  // Helpful debug logs and error handlers
  socket.on('connect', () => console.log('socket connected', socket.id, '->', url));
  socket.on('connect_error', (err) => console.error('Socket connect_error', err));
  socket.on('error', (e) => console.error('Socket error', e));

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
