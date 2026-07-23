import { Injectable } from '@nestjs/common';
import { DealStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  findAll() {
    return this.prisma.deal.findMany({ include: { startup: true }, orderBy: { closedAt: 'desc' } });
  }

  async create(data: {
    startupId: string;
    sharkId?: string | null;
    leadInvestor: string;
    dealSize: string;
    valuation: string;
    status?: DealStatus;
  }) {
    const deal = await this.prisma.deal.create({ data, include: { startup: true } });
    this.realtime.emit('deal_accepted', deal);
    return deal;
  }

  async analytics() {
    const [totalDeals, deals, startupsCount] = await Promise.all([
      this.prisma.deal.count(),
      this.prisma.deal.findMany({ include: { startup: true }, orderBy: { closedAt: 'desc' }, take: 20 }),
      this.prisma.startup.count(),
    ]);

    const acceptedOffers = await this.prisma.offer.count({ where: { status: 'ACCEPTED' } });
    const totalOffers = await this.prisma.offer.count();
    const acceptanceRate = totalOffers > 0 ? ((acceptedOffers / totalOffers) * 100).toFixed(1) : '0.0';

    return {
      totalCapitalDeployed: this.sumDealSizes(deals),
      avgValuation: this.averageValuation(deals),
      completedEvents: await this.prisma.event.count({ where: { liveStatus: 'ENDED' } }),
      acceptanceRate: `${acceptanceRate}%`,
      deals,
      startupsCount,
      totalDealsCount: totalDeals,
    };
  }

  private sumDealSizes(deals: { dealSize: string }[]): string {
    const total = deals.reduce((sum, deal) => sum + this.parseCurrency(deal.dealSize), 0);
    return this.formatCurrency(total);
  }

  private averageValuation(deals: { valuation: string }[]): string {
    if (deals.length === 0) return '$0';
    const total = deals.reduce((sum, deal) => sum + this.parseCurrency(deal.valuation), 0);
    return this.formatCurrency(total / deals.length);
  }

  private parseCurrency(value: string): number {
    const cleaned = value.replace(/[^0-9.KMB]/gi, '');
    const multiplier = /B$/i.test(cleaned) ? 1_000_000_000 : /M$/i.test(cleaned) ? 1_000_000 : /K$/i.test(cleaned) ? 1_000 : 1;
    const numeric = parseFloat(cleaned.replace(/[KMB]/gi, ''));
    return Number.isFinite(numeric) ? numeric * multiplier : 0;
  }

  private formatCurrency(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  }
}
