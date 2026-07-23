import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/startups - List all startups
router.get('/', async (req, res) => {
  try {
    const startups = await prisma.startup.findMany({
      include: {
        founders: {
          include: {
            user: {
              select: { name: true, email: true, avatar: true }
            }
          }
        },
        offers: true,
        deals: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(startups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/startups/:id - Get single startup details
router.get('/:id', async (req, res) => {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: req.params.id },
      include: {
        founders: {
          include: {
            user: { select: { name: true, email: true, avatar: true } }
          }
        },
        offers: true,
        deals: true,
        timelineEvents: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    res.json(startup);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/startups - Create a new startup (Founder only)
router.post('/', authenticateJWT, requireRole('FOUNDER', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, sector, stage, description, fundingAsk, equityOffered, valuation, arr, clients } = req.body;

    if (!name || !sector || !stage || !fundingAsk || !equityOffered || !valuation) {
      return res.status(400).json({ error: 'Missing required startup parameters' });
    }

    const startup = await prisma.startup.create({
      data: {
        name,
        sector,
        stage,
        description: description || '',
        fundingAsk,
        equityOffered,
        valuation,
        arr: arr || '$0',
        clients: clients || '0',
        founderId: req.user?.id
      }
    });

    if (req.user) {
      await prisma.founder.create({
        data: {
          userId: req.user.id,
          startupId: startup.id,
          bio: `Founder of ${name}`
        }
      });
    }

    res.status(201).json(startup);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
