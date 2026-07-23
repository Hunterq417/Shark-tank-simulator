import { BadRequestException } from '@nestjs/common';
import { OffersService } from './offers.service';

describe('OffersService', () => {
  let service: OffersService;
  let prisma: any;
  let realtime: any;
  let timeline: any;
  let notifications: any;
  let deals: any;

  const startup = { id: 'startup-1' };
  const pendingOffer = {
    id: 'offer-1',
    startupId: 'startup-1',
    sharkId: 'shark-1',
    sharkName: 'Apex Ventures',
    amount: '$500K',
    equity: '5%',
    valuation: '$25M',
    status: 'PENDING',
    startup,
  };

  beforeEach(() => {
    prisma = {
      startup: { findUnique: jest.fn().mockResolvedValue(startup) },
      offer: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      counterOffer: { create: jest.fn() },
    };
    realtime = { emit: jest.fn(), emitToRoom: jest.fn() };
    timeline = { record: jest.fn() };
    notifications = { create: jest.fn() };
    deals = { create: jest.fn() };

    service = new OffersService(prisma, realtime, timeline, notifications, deals);
  });

  describe('withdraw', () => {
    it('rejects withdrawal by a shark who does not own the offer', async () => {
      prisma.offer.findUnique.mockResolvedValue(pendingOffer);

      await expect(
        service.withdraw({ id: 'shark-2', role: 'SHARK' } as any, 'offer-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows the owning shark to withdraw a pending offer', async () => {
      prisma.offer.findUnique.mockResolvedValue(pendingOffer);
      prisma.offer.update.mockResolvedValue({ ...pendingOffer, status: 'WITHDRAWN' });

      const result = await service.withdraw({ id: 'shark-1', role: 'SHARK' } as any, 'offer-1');

      expect(result.status).toBe('WITHDRAWN');
      expect(realtime.emit).toHaveBeenCalledWith('offer_withdrawn', expect.anything());
    });

    it('rejects withdrawing an already accepted offer', async () => {
      prisma.offer.findUnique.mockResolvedValue({ ...pendingOffer, status: 'ACCEPTED' });

      await expect(
        service.withdraw({ id: 'shark-1', role: 'SHARK' } as any, 'offer-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('counter', () => {
    it('rejects countering a withdrawn offer', async () => {
      prisma.offer.findUnique.mockResolvedValue({ ...pendingOffer, status: 'WITHDRAWN' });

      await expect(
        service.counter({ id: 'founder-1', role: 'FOUNDER' } as any, 'offer-1', {
          amount: '$600K',
          equity: '6%',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('accept', () => {
    it('creates a deal and marks the offer accepted', async () => {
      prisma.offer.findUnique.mockResolvedValue(pendingOffer);
      prisma.offer.update.mockResolvedValue({ ...pendingOffer, status: 'ACCEPTED' });

      const result = await service.accept('offer-1');

      expect(deals.create).toHaveBeenCalledWith(
        expect.objectContaining({ startupId: 'startup-1', leadInvestor: 'Apex Ventures' }),
      );
      expect(result.status).toBe('ACCEPTED');
    });

    it('rejects accepting a withdrawn offer', async () => {
      prisma.offer.findUnique.mockResolvedValue({ ...pendingOffer, status: 'WITHDRAWN' });
      await expect(service.accept('offer-1')).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
