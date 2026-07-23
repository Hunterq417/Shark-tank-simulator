import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PitchTimerService } from './pitch-timer.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const eventDetailInclude = {
  startup: {
    include: {
      offers: { orderBy: { createdAt: 'desc' } },
      timelineEvents: { orderBy: { timestamp: 'desc' } },
    },
  },
  pitches: true,
} as const;

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly pitchTimer: PitchTimerService,
  ) {}

  findAll() {
    return this.prisma.event.findMany({
      include: { startup: true, pitches: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async findLive() {
    const liveEvent = await this.prisma.event.findFirst({
      where: { liveStatus: 'LIVE' },
      include: eventDetailInclude,
      orderBy: { startTime: 'desc' },
    });

    if (liveEvent) return liveEvent;

    const fallback = await this.prisma.event.findFirst({
      include: eventDetailInclude,
      orderBy: { startTime: 'desc' },
    });

    if (!fallback) {
      throw new NotFoundException('No live events found');
    }
    return fallback;
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id }, include: eventDetailInclude });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(dto: CreateEventDto) {
    const startup = await this.prisma.startup.findUnique({ where: { id: dto.startupId } });
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }
    return this.prisma.event.create({ data: dto });
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findById(id);
    return this.prisma.event.update({ where: { id }, data: dto });
  }

  private async setStatus(id: string, liveStatus: 'UPCOMING' | 'LIVE' | 'PAUSED' | 'ENDED', extra: Record<string, unknown> = {}) {
    await this.findById(id);
    const event = await this.prisma.event.update({ where: { id }, data: { liveStatus, ...extra } });
    this.realtime.emit('event_status_changed', event);
    return event;
  }

  async start(id: string) {
    const event = await this.setStatus(id, 'LIVE', { startTime: new Date() });
    this.pitchTimer.start(id);
    return event;
  }

  async pause(id: string) {
    const event = await this.setStatus(id, 'PAUSED');
    this.pitchTimer.pause(id);
    return event;
  }

  async resume(id: string) {
    const event = await this.setStatus(id, 'LIVE');
    this.pitchTimer.resume(id);
    return event;
  }

  async end(id: string) {
    const event = await this.setStatus(id, 'ENDED', { endedAt: new Date() });
    this.pitchTimer.stop(id);
    return event;
  }
}
