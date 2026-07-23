import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/negotiations/room/:roomCode - Get active negotiation room state
router.get('/room/:roomCode', async (req, res) => {
  try {
    const roomCode = req.params.roomCode;

    let negotiation = await prisma.negotiation.findFirst({
      where: { roomCode },
      include: {
        offer: { include: { counterOffers: true } },
        startup: { include: { timelineEvents: true } },
        chatMessages: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!negotiation) {
      // Fallback or create default room
      const firstOffer = await prisma.offer.findFirst();
      const firstStartup = await prisma.startup.findFirst();

      if (firstOffer && firstStartup) {
        negotiation = await prisma.negotiation.create({
          data: {
            offerId: firstOffer.id,
            startupId: firstStartup.id,
            roomCode,
            status: 'ACTIVE'
          },
          include: {
            offer: { include: { counterOffers: true } },
            startup: { include: { timelineEvents: true } },
            chatMessages: { orderBy: { createdAt: 'asc' } }
          }
        });
      } else {
        return res.status(404).json({ error: 'Negotiation room not found' });
      }
    }

    res.json(negotiation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/negotiations/:id/messages - Post new chat message
router.post('/:id/messages', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { text, senderRole } = req.body;
    const negotiationId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: 'Message text required' });
    }

    const senderName = req.user?.company || req.user?.name || 'Investor';
    const role = senderRole || (req.user?.role === 'FOUNDER' ? 'Founder' : 'Investor');

    const message = await prisma.chatMessage.create({
      data: {
        negotiationId,
        senderRole: role,
        senderName,
        text
      }
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/negotiations/:id/focus - Toggle Focus Mode
router.patch('/:id/focus', authenticateJWT, async (req, res) => {
  try {
    const { focusMode } = req.body;
    const negotiationId = req.params.id;

    const updated = await prisma.negotiation.update({
      where: { id: negotiationId },
      data: { focusMode: Boolean(focusMode) }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
