import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketOrigin = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '') || window.location.origin;
    socket = io(socketOrigin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: localStorage.getItem('access_token') || undefined
      }
    });

    socket.on('connect', () => {
      console.log('[Socket.io Client] Connected to real-time server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io Client] Disconnected from server');
    });
  }

  return socket;
}
