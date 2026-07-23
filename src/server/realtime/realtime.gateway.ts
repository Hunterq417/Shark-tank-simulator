import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

interface ConnectedUser {
  id: string;
  name: string;
  role: string;
}

@WebSocketGateway({
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly onlineUsers = new Map<string, ConnectedUser>();

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ||
      (client.handshake.headers.authorization?.toString().replace('Bearer ', '') as string | undefined);

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync(token, {
          secret: this.config.get<string>('JWT_SECRET', 'ventureflow_super_secret_jwt_key_2026_prod'),
        });
        client.data.user = { id: payload.sub, name: payload.name, role: payload.role };
        this.onlineUsers.set(client.id, client.data.user);
      } catch {
        this.logger.debug(`Socket ${client.id} connected with an invalid token; continuing as anonymous`);
      }
    }

    this.logger.log(`Client connected: ${client.id}`);
    this.broadcastOnlineUsers();
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.broadcastOnlineUsers();
  }

  private broadcastOnlineUsers() {
    this.server.emit('online_users', {
      count: this.onlineUsers.size,
      users: Array.from(this.onlineUsers.values()),
    });
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
    this.server.to(room).emit('user_joined', { socketId: client.id, room });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
  }

  /** Broadcast to every connected client. */
  emit(event: string, payload: unknown) {
    this.server?.emit(event, payload);
  }

  /** Broadcast to a specific room (e.g. a negotiation room code). */
  emitToRoom(room: string, event: string, payload: unknown) {
    this.server?.to(room).emit(event, payload);
  }
}
