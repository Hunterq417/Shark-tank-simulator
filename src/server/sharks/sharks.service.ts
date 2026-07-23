import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSharkDto } from './dto/update-shark.dto';

const sharkInclude = {
  user: { select: { id: true, name: true, email: true, avatar: true } },
} as const;

@Injectable()
export class SharksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.shark.findMany({ include: sharkInclude, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const shark = await this.prisma.shark.findUnique({ where: { id }, include: sharkInclude });
    if (!shark) {
      throw new NotFoundException('Shark not found');
    }
    return shark;
  }

  async findByUserId(userId: string) {
    const shark = await this.prisma.shark.findFirst({ where: { userId }, include: sharkInclude });
    if (!shark) {
      throw new NotFoundException('No shark profile exists for this user yet');
    }
    return shark;
  }

  async updateByUserId(userId: string, dto: UpdateSharkDto) {
    const shark = await this.findByUserId(userId);
    return this.prisma.shark.update({ where: { id: shark.id }, data: dto, include: sharkInclude });
  }

  async portfolio(sharkId: string) {
    const shark = await this.findById(sharkId);
    const [offers, deals] = await Promise.all([
      this.prisma.offer.findMany({
        where: { sharkName: shark.fundName },
        include: { startup: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deal.findMany({
        where: { leadInvestor: shark.fundName },
        include: { startup: true },
        orderBy: { closedAt: 'desc' },
      }),
    ]);
    return { offers, deals };
  }
}
