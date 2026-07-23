import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPitchDto } from './dto/upsert-pitch.dto';

@Injectable()
export class PitchService {
  constructor(private readonly prisma: PrismaService) {}

  async getForEvent(eventId: string) {
    const pitch = await this.prisma.pitch.findFirst({ where: { eventId }, include: { startup: true } });
    if (!pitch) {
      throw new NotFoundException('No pitch session recorded for this event yet');
    }
    return pitch;
  }

  async upsert(dto: UpsertPitchDto) {
    const existing = await this.prisma.pitch.findFirst({
      where: { eventId: dto.eventId, startupId: dto.startupId },
    });

    if (existing) {
      return this.prisma.pitch.update({
        where: { id: existing.id },
        data: dto,
        include: { startup: true },
      });
    }

    return this.prisma.pitch.create({ data: dto, include: { startup: true } });
  }
}
