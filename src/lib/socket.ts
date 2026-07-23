import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true
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
