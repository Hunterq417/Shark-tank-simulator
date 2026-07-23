import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/events/live - Get current live pitch event
router.get('/live', async (req, res) => {
  try {
    const liveEvent = await prisma.event.findFirst({
      where: { liveStatus: 'LIVE' },
      include: {
        startup: {
          include: {
            offers: {
              orderBy: { createdAt: 'desc' }
            },
            timelineEvents: {
              orderBy: { timestamp: 'desc' }
            }
          }
        },
        pitches: true
      }
    });

    if (!liveEvent) {
      // Fallback to first event if no LIVE status
      const fallbackEvent = await prisma.event.findFirst({
        include: {
          startup: {
            include: { offers: true, timelineEvents: true }
          },
          pitches: true
        }
      });

      if (!fallbackEvent) {
        return res.status(404).json({ error: 'No live events found' });
      }
      return res.json(fallbackEvent);
    }

    res.json(liveEvent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events - List pitch events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { startup: true, pitches: true },
      orderBy: { startTime: 'desc' }
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
