import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

const startupListInclude = {
  founders: { include: { user: { select: { name: true, email: true, avatar: true } } } },
  offers: true,
  deals: true,
} as const;

@Injectable()
export class StartupsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.startup.findMany({ include: startupListInclude, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },
      include: {
        ...startupListInclude,
        timelineEvents: { orderBy: { timestamp: 'desc' } },
      },
    });
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }
    return startup;
  }

  async create(user: CurrentUserPayload, dto: CreateStartupDto) {
    const startup = await this.prisma.startup.create({
      data: {
        ...dto,
        description: dto.description ?? '',
        arr: dto.arr ?? '$0',
        clients: dto.clients ?? '0',
      },
    });

    const existingFounder = await this.prisma.founder.findFirst({ where: { userId: user.id } });
    if (existingFounder) {
      await this.prisma.founder.update({ where: { id: existingFounder.id }, data: { startupId: startup.id } });
    } else {
      await this.prisma.founder.create({
        data: { userId: user.id, startupId: startup.id, bio: `Founder of ${startup.name}` },
      });
    }

    return startup;
  }

  private async assertOwnership(startupId: string, user: CurrentUserPayload) {
    if (user.role === Role.ADMIN) return;

    const founder = await this.prisma.founder.findFirst({ where: { userId: user.id, startupId } });
    if (!founder) {
      throw new ForbiddenException('You do not have permission to modify this startup');
    }
  }

  async update(id: string, user: CurrentUserPayload, dto: UpdateStartupDto) {
    await this.findById(id);
    await this.assertOwnership(id, user);
    return this.prisma.startup.update({ where: { id }, data: dto });
  }
}
