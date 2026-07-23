import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupSocketIO(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room (e.g. 'live-pitch', 'room-101', 'negotiation-xyz')
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`[Socket.io] Client ${socket.id} joined room: ${room}`);
      io.to(room).emit('user_joined', { socketId: socket.id, room });
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`[Socket.io] Client ${socket.id} left room: ${room}`);
    });

    // Handle submit offer
    socket.on('submit_offer', async (data: { startupId: string; amount: string; equity: string; sharkName: string; terms?: string }) => {
      try {
        const offer = await prisma.offer.create({
          data: {
            startupId: data.startupId,
            sharkName: data.sharkName || 'Apex Ventures',
            amount: data.amount,
            equity: data.equity,
            valuation: '$25,000,000',
            terms: data.terms || 'Pro-Rata & Board Observer Rights',
            status: 'PENDING'
          }
        });

        // Broadcast to all clients
        io.emit('offer_created', offer);
        io.emit('ticker_updated', {
          id: offer.id,
          text: `NEW BID: ${data.sharkName} placed ${data.amount} for ${data.equity}`
        });
      } catch (err) {
        console.error('[Socket.io] submit_offer error:', err);
      }
    });

    // Handle counter offer
    socket.on('counter_offer', async (data: { offerId: string; amount: string; equity: string; senderRole: string; senderName: string }) => {
      try {
        const counter = await prisma.counterOffer.create({
          data: {
            offerId: data.offerId,
            senderRole: data.senderRole,
            senderName: data.senderName,
            amount: data.amount,
            equity: data.equity,
            terms: 'Counter offer terms adjusted'
          }
        });

        await prisma.offer.update({
          where: { id: data.offerId },
          data: { status: 'COUNTERED' }
        });

        io.emit('offer_updated', { offerId: data.offerId, counter });
      } catch (err) {
        console.error('[Socket.io] counter_offer error:', err);
      }
    });

    // Handle negotiation room chat message
    socket.on('send_chat_message', async (data: { negotiationId: string; roomCode: string; text: string; senderRole: string; senderName: string }) => {
      try {
        const message = await prisma.chatMessage.create({
          data: {
            negotiationId: data.negotiationId,
            senderRole: data.senderRole || 'Investor',
            senderName: data.senderName || 'Apex Ventures',
            text: data.text
          }
        });

        io.to(data.roomCode || 'ROOM-101').emit('chat_message', message);
        io.emit('chat_message', message);
      } catch (err) {
        console.error('[Socket.io] send_chat_message error:', err);
      }
    });

    // Handle Focus Mode toggle
    socket.on('toggle_focus_mode', (data: { roomCode: string; focusMode: boolean }) => {
      io.to(data.roomCode).emit('focus_mode_changed', { focusMode: data.focusMode });
      io.emit('focus_mode_changed', { focusMode: data.focusMode });
    });

    // Handle Virtual Deal Table sync
    socket.on('update_virtual_table', (data: any) => {
      io.emit('virtual_table_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
