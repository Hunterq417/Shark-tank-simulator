import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFounderDto } from './dto/update-founder.dto';

const founderInclude = {
  user: { select: { id: true, name: true, email: true, avatar: true } },
  startup: true,
} as const;

@Injectable()
export class FoundersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.founder.findMany({ include: founderInclude, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const founder = await this.prisma.founder.findUnique({ where: { id }, include: founderInclude });
    if (!founder) {
      throw new NotFoundException('Founder not found');
    }
    return founder;
  }

  async findByUserId(userId: string) {
    const founder = await this.prisma.founder.findFirst({ where: { userId }, include: founderInclude });
    if (!founder) {
      throw new NotFoundException('No founder profile exists for this user yet');
    }
    return founder;
  }

  async getStartupForUser(userId: string) {
    const founder = await this.findByUserId(userId);
    if (!founder.startup) {
      throw new NotFoundException('This founder has not created a startup profile yet');
    }
    return founder.startup;
  }

  async updateByUserId(userId: string, dto: UpdateFounderDto) {
    const founder = await this.findByUserId(userId);
    return this.prisma.founder.update({
      where: { id: founder.id },
      data: dto,
      include: founderInclude,
    });
  }
}
