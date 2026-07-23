import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TimelineService } from '../timeline/timeline.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DealsService } from '../deals/deals.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CounterOfferDto } from './dto/counter-offer.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

const offerInclude = {
  startup: true,
  counterOffers: { orderBy: { createdAt: 'desc' as const } },
  negotiations: true,
};

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly timeline: TimelineService,
    private readonly notifications: NotificationsService,
    private readonly deals: DealsService,
  ) {}

  findAll() {
    return this.prisma.offer.findMany({ include: offerInclude, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id }, include: offerInclude });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async create(user: CurrentUserPayload, dto: CreateOfferDto) {
    const startup = await this.prisma.startup.findUnique({ where: { id: dto.startupId } });
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    const sharkName = user.company || user.name;

    const offer = await this.prisma.offer.create({
      data: {
        startupId: dto.startupId,
        sharkId: user.id,
        sharkName,
        amount: dto.amount,
        equity: dto.equity,
        valuation: dto.valuation || '$25,000,000',
        terms: dto.terms || 'Standard Pro-Rata & Board Observer Rights',
        status: 'PENDING',
      },
      include: offerInclude,
    });

    await this.timeline.record(
      dto.startupId,
      `New Offer: ${dto.amount} for ${dto.equity}`,
      `Submitted by ${sharkName}`,
      'OFFER',
    );

    await this.notifications.create({
      title: 'New Offer Received',
      message: `${sharkName} placed a ${dto.amount} bid for ${dto.equity} equity.`,
      type: 'OFFER',
    });

    this.realtime.emit('offer_created', offer);
    this.realtime.emit('ticker_updated', {
      id: offer.id,
      text: `NEW BID: ${sharkName} placed ${dto.amount} for ${dto.equity}`,
    });

    return offer;
  }

  async counter(user: CurrentUserPayload, offerId: string, dto: CounterOfferDto) {
    const offer = await this.findById(offerId);

    if (offer.status === 'ACCEPTED' || offer.status === 'REJECTED' || offer.status === 'WITHDRAWN') {
      throw new BadRequestException(`Cannot counter an offer that is already ${offer.status.toLowerCase()}`);
    }

    const senderRole = user.role === 'FOUNDER' ? 'FOUNDER' : 'SHARK';
    const senderName = user.company || user.name;

    const counter = await this.prisma.counterOffer.create({
      data: {
        offerId,
        senderRole,
        senderName,
        amount: dto.amount,
        equity: dto.equity,
        terms: dto.terms || 'Adjusted valuation term sheet',
      },
    });

    const updatedOffer = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'COUNTERED' },
      include: offerInclude,
    });

    await this.timeline.record(
      offer.startupId,
      `Counter Offer: ${dto.amount} for ${dto.equity}`,
      `Proposed by ${senderName}`,
      'COUNTER',
    );

    this.realtime.emit('counter_offer_created', { offerId, counter });
    this.realtime.emit('offer_updated', { offerId, counter, offer: updatedOffer });
    return counter;
  }

  async accept(offerId: string) {
    const offer = await this.findById(offerId);

    if (offer.status === 'ACCEPTED') {
      throw new BadRequestException('Offer is already accepted');
    }
    if (offer.status === 'WITHDRAWN') {
      throw new BadRequestException('Cannot accept a withdrawn offer');
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
      include: offerInclude,
    });

    await this.deals.create({
      startupId: offer.startupId,
      sharkId: offer.sharkId,
      leadInvestor: offer.sharkName,
      dealSize: offer.amount,
      valuation: offer.valuation || '$25.0M',
      status: 'CLOSED',
    });

    await this.timeline.record(
      offer.startupId,
      `Deal Accepted with ${offer.sharkName}`,
      `Term sheet signed for ${offer.amount} at ${offer.equity}`,
      'ACCEPTANCE',
    );

    this.realtime.emit('offer_updated', { offerId, offer: updatedOffer });
    return updatedOffer;
  }

  async reject(offerId: string) {
    await this.findById(offerId);
    const updatedOffer = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' },
      include: offerInclude,
    });
    this.realtime.emit('offer_updated', { offerId, offer: updatedOffer });
    return updatedOffer;
  }

  async withdraw(user: CurrentUserPayload, offerId: string) {
    const offer = await this.findById(offerId);

    if (user.role !== 'ADMIN' && offer.sharkId !== user.id) {
      throw new BadRequestException('You can only withdraw offers you submitted');
    }
    if (offer.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot withdraw an accepted offer');
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'WITHDRAWN', withdrawnAt: new Date() },
      include: offerInclude,
    });

    this.realtime.emit('offer_withdrawn', { offerId, offer: updatedOffer });
    return updatedOffer;
  }
}
