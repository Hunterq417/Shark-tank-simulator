import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/offers - List all offers
router.get('/', async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      include: {
        startup: true,
        counterOffers: { orderBy: { createdAt: 'desc' } },
        negotiations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(offers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/offers - Create new term sheet offer
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { startupId, amount, equity, terms, valuation } = req.body;

    if (!startupId || !amount || !equity) {
      return res.status(400).json({ error: 'startupId, amount, and equity are required' });
    }

    const sharkName = req.user?.company || req.user?.name || 'Apex Ventures';

    const offer = await prisma.offer.create({
      data: {
        startupId,
        sharkName,
        amount,
        equity,
        valuation: valuation || '$25,000,000',
        terms: terms || 'Standard Pro-Rata & Board Observer Rights',
        status: 'PENDING'
      },
      include: { startup: true }
    });

    // Create timeline event for startup
    await prisma.timelineEvent.create({
      data: {
        startupId,
        title: `New Offer: ${amount} for ${equity}`,
        description: `Submitted by ${sharkName}`,
        category: 'offer'
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        title: 'New Offer Received',
        message: `${sharkName} placed a ${amount} bid for ${equity} equity.`,
        type: 'offer'
      }
    });

    res.status(201).json(offer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/offers/:id/counter - Counter an offer
router.post('/:id/counter', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { amount, equity, terms } = req.body;
    const offerId = req.params.id;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { startup: true }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const senderRole = req.user?.role === 'FOUNDER' ? 'FOUNDER' : 'SHARK';
    const senderName = req.user?.name || (senderRole === 'FOUNDER' ? 'Founder' : 'Investor');

    const counter = await prisma.counterOffer.create({
      data: {
        offerId,
        senderRole,
        senderName,
        amount,
        equity,
        terms: terms || 'Adjusted valuation term sheet'
      }
    });

    // Update main offer status to COUNTERED
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'COUNTERED' }
    });

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        startupId: offer.startupId,
        title: `Counter Offer: ${amount} for ${equity}`,
        description: `Proposed by ${senderName}`,
        category: 'counter'
      }
    });

    res.status(201).json(counter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/offers/:id/accept - Accept an offer
router.post('/:id/accept', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const offerId = req.params.id;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { startup: true }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' }
    });

    // Create Deal record
    await prisma.deal.create({
      data: {
        startupId: offer.startupId,
        leadInvestor: offer.sharkName,
        dealSize: offer.amount,
        valuation: offer.valuation || '$25.0M',
        status: 'Closed'
      }
    });

    // Timeline event
    await prisma.timelineEvent.create({
      data: {
        startupId: offer.startupId,
        title: `Deal Accepted with ${offer.sharkName}`,
        description: `Term sheet signed for ${offer.amount} at ${offer.equity}`,
        category: 'acceptance'
      }
    });

    res.json(updatedOffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/offers/:id/reject - Reject an offer
router.post('/:id/reject', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const offerId = req.params.id;

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' }
    });

    res.json(updatedOffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
