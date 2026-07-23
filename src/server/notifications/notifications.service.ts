import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  findAll(userId?: string) {
    return this.prisma.notification.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async create(data: { title: string; message: string; type: NotificationType; userId?: string | null }) {
    const notification = await this.prisma.notification.create({ data });
    this.realtime.emit('notification_created', notification);
    return notification;
  }

  async markRead(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(userId?: string) {
    await this.prisma.notification.updateMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : undefined,
      data: { read: true },
    });
    return { success: true };
  }
}
