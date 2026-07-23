import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TimelineCategory } from '@prisma/client';

@Injectable()
export class TimelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  findForStartup(startupId: string) {
    return this.prisma.timelineEvent.findMany({
      where: { startupId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async record(startupId: string, title: string, description: string, category: TimelineCategory) {
    const event = await this.prisma.timelineEvent.create({
      data: { startupId, title, description, category },
    });
    this.realtime.emit('timeline_updated', event);
    return event;
  }
}
