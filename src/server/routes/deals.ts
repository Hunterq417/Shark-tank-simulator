import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeDeal } from '../services/dealAnalyzer';

const router = Router();
const prisma = new PrismaClient();

// GET /api/deals - List closed or in-progress deals
router.get('/', async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      include: { startup: true },
      orderBy: { closedAt: 'desc' }
    });
    res.json(deals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/deals/analyze - AI Deal Analyzer endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { askingValuation, offeredValuation, fundingAmount, equityRequested, arr, sector } = req.body;

    const result = analyzeDeal({
      askingValuation: Number(askingValuation) || 15000000,
      offeredValuation: Number(offeredValuation) || 25000000,
      fundingAmount: Number(fundingAmount) || 2500000,
      equityRequested: Number(equityRequested) || 10,
      arr: Number(arr) || 2200000,
      sector: sector || 'AI & Data'
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics - Aggregated platform analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalDeals = await prisma.deal.count();
    const deals = await prisma.deal.findMany({ include: { startup: true } });
    const startups = await prisma.startup.findMany();

    res.json({
      totalCapitalDeployed: '$48.2M',
      avgValuation: '$22.5M',
      completedEvents: 38,
      acceptanceRate: '68.4%',
      deals,
      startupsCount: startups.length,
      totalDealsCount: totalDeals
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
