import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  record(action: string, details: string, userId?: string | null) {
    return this.prisma.activityLog.create({ data: { action, details, userId } });
  }

  findAll() {
    return this.prisma.activityLog.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}
