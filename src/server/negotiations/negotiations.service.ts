import { Injectable, NotFoundException } from '@nestjs/common';
import { SenderRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateNegotiationDto } from './dto/create-negotiation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateNegotiationStatusDto } from './dto/update-status.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

const roomInclude = {
  offer: { include: { counterOffers: { orderBy: { createdAt: 'desc' as const } } } },
  startup: { include: { timelineEvents: { orderBy: { timestamp: 'desc' as const } } } },
  chatMessages: { orderBy: { createdAt: 'asc' as const } },
};

function toDbSenderRole(role?: string): SenderRole {
  if (role === 'Founder') return 'FOUNDER';
  if (role === 'System') return 'SYSTEM';
  return 'SHARK';
}

function toDisplaySenderRole(role: SenderRole): string {
  if (role === 'FOUNDER') return 'Founder';
  if (role === 'SYSTEM') return 'System';
  return 'Investor';
}

@Injectable()
export class NegotiationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateNegotiationDto) {
    const offer = await this.prisma.offer.findUnique({ where: { id: dto.offerId } });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const negotiation = await this.prisma.negotiation.create({
      data: {
        offerId: dto.offerId,
        startupId: offer.startupId,
        sharkId: offer.sharkId,
        roomCode: dto.roomCode || `ROOM-${offer.id.slice(0, 6).toUpperCase()}`,
      },
      include: roomInclude,
    });

    this.realtime.emit('negotiation_started', negotiation);
    return negotiation;
  }

  async getRoom(roomCode: string) {
    let negotiation = await this.prisma.negotiation.findFirst({ where: { roomCode }, include: roomInclude });

    if (!negotiation) {
      const fallbackOffer = await this.prisma.offer.findFirst({
        where: { status: { in: ['PENDING', 'COUNTERED'] } },
        orderBy: { createdAt: 'desc' },
      });

      if (!fallbackOffer) {
        throw new NotFoundException('No active offer available to start a negotiation room');
      }

      negotiation = await this.prisma.negotiation.create({
        data: {
          offerId: fallbackOffer.id,
          startupId: fallbackOffer.startupId,
          sharkId: fallbackOffer.sharkId,
          roomCode,
        },
        include: roomInclude,
      });

      this.realtime.emit('negotiation_started', negotiation);
    }

    return negotiation;
  }

  async sendMessage(user: CurrentUserPayload, negotiationId: string, dto: SendMessageDto) {
    const negotiation = await this.prisma.negotiation.findUnique({ where: { id: negotiationId } });
    if (!negotiation) {
      throw new NotFoundException('Negotiation not found');
    }

    const senderRole = dto.senderRole ? toDbSenderRole(dto.senderRole) : toDbSenderRole(user.role === 'FOUNDER' ? 'Founder' : 'Investor');
    const senderName = user.company || user.name;

    const message = await this.prisma.chatMessage.create({
      data: {
        negotiationId,
        senderId: user.id,
        senderRole,
        senderName,
        text: dto.text,
      },
    });

    const payload = { ...message, senderRole: toDisplaySenderRole(message.senderRole) };
    this.realtime.emitToRoom(negotiation.roomCode, 'chat_message', payload);
    this.realtime.emit('chat_message', payload);
    return payload;
  }

  async toggleFocus(negotiationId: string, focusMode: boolean) {
    const negotiation = await this.prisma.negotiation.update({
      where: { id: negotiationId },
      data: { focusMode },
    });
    this.realtime.emit('focus_mode_changed', { negotiationId, focusMode });
    this.realtime.emitToRoom(negotiation.roomCode, 'focus_mode_changed', { negotiationId, focusMode });
    return negotiation;
  }

  async updateStatus(negotiationId: string, dto: UpdateNegotiationStatusDto) {
    const negotiation = await this.prisma.negotiation.update({
      where: { id: negotiationId },
      data: { status: dto.status },
    });

    const event = dto.status === 'ACCEPTED' ? 'deal_accepted' : dto.status === 'REJECTED' ? 'deal_rejected' : 'negotiation_updated';
    this.realtime.emit(event, negotiation);
    return negotiation;
  }
}
