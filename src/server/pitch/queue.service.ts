import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ReorderQueueDto } from './dto/reorder-queue.dto';

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async list(eventId: string) {
    return this.prisma.pitchQueueEntry.findMany({
      where: { eventId },
      include: { startup: true },
      orderBy: { position: 'asc' },
    });
  }

  async join(dto: JoinQueueDto) {
    const [event, startup] = await Promise.all([
      this.prisma.event.findUnique({ where: { id: dto.eventId } }),
      this.prisma.startup.findUnique({ where: { id: dto.startupId } }),
    ]);
    if (!event) throw new NotFoundException('Event not found');
    if (!startup) throw new NotFoundException('Startup not found');

    const existing = await this.prisma.pitchQueueEntry.findUnique({
      where: { eventId_startupId: { eventId: dto.eventId, startupId: dto.startupId } },
    });
    if (existing) {
      throw new BadRequestException('Startup is already in this event queue');
    }

    const last = await this.prisma.pitchQueueEntry.findFirst({
      where: { eventId: dto.eventId },
      orderBy: { position: 'desc' },
    });

    const entry = await this.prisma.pitchQueueEntry.create({
      data: {
        eventId: dto.eventId,
        startupId: dto.startupId,
        position: (last?.position ?? -1) + 1,
      },
      include: { startup: true },
    });

    await this.broadcastQueue(dto.eventId);
    return entry;
  }

  async reorder(eventId: string, dto: ReorderQueueDto) {
    await this.prisma.$transaction(
      dto.entries.map((e) =>
        this.prisma.pitchQueueEntry.update({ where: { id: e.id }, data: { position: e.position } }),
      ),
    );
    return this.broadcastQueue(eventId);
  }

  async advance(eventId: string) {
    const active = await this.prisma.pitchQueueEntry.findFirst({ where: { eventId, status: 'ACTIVE' } });
    if (active) {
      await this.prisma.pitchQueueEntry.update({ where: { id: active.id }, data: { status: 'DONE' } });
    }

    const next = await this.prisma.pitchQueueEntry.findFirst({
      where: { eventId, status: 'WAITING' },
      orderBy: { position: 'asc' },
    });

    if (next) {
      await this.prisma.pitchQueueEntry.update({ where: { id: next.id }, data: { status: 'ACTIVE' } });
    }

    return this.broadcastQueue(eventId);
  }

  async skip(id: string) {
    const entry = await this.prisma.pitchQueueEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Queue entry not found');
    await this.prisma.pitchQueueEntry.update({ where: { id }, data: { status: 'SKIPPED' } });
    return this.broadcastQueue(entry.eventId);
  }

  private async broadcastQueue(eventId: string) {
    const queue = await this.list(eventId);
    this.realtime.emit('queue_updated', { eventId, queue });
    return queue;
  }
}
