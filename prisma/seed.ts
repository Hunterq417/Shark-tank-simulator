import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VentureFlow Database...');

  // Clean existing data
  await prisma.chatMessage.deleteMany();
  await prisma.negotiation.deleteMany();
  await prisma.counterOffer.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.pitch.deleteMany();
  await prisma.event.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.founder.deleteMany();
  await prisma.shark.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ventureflow.io',
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
      company: 'VentureFlow Global',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      balance: '$100,000,000',
      dealsClosed: 42
    }
  });

  // 2. Create 4 Sharks (Investors)
  const sharksData = [
    {
      name: 'Alexander Wright',
      email: 'a.wright@apexventures.io',
      role: 'SHARK',
      company: 'Apex Syndicate',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
      balance: '$12,500,000',
      dealsClosed: 14,
      minTicket: '$100K',
      maxTicket: '$5M',
      escrowBalance: '$25,000,000'
    },
    {
      name: 'Sarah Jenkins',
      email: 'sarah@jenkinsangels.com',
      role: 'SHARK',
      company: 'Jenkins Capital',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop',
      balance: '$18,000,000',
      dealsClosed: 22,
      minTicket: '$250K',
      maxTicket: '$10M',
      escrowBalance: '$35,000,000'
    },
    {
      name: 'Marcus Vance',
      email: 'm.vance@silverlakefund.com',
      role: 'SHARK',
      company: 'Silver Lake Partners',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
      balance: '$45,000,000',
      dealsClosed: 31,
      minTicket: '$500K',
      maxTicket: '$15M',
      escrowBalance: '$80,000,000'
    },
    {
      name: 'Elena Rostova',
      email: 'elena@sequoiaglobal.com',
      role: 'SHARK',
      company: 'Sequoia Growth',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
      balance: '$60,000,000',
      dealsClosed: 28,
      minTicket: '$1M',
      maxTicket: '$20M',
      escrowBalance: '$120,000,000'
    }
  ];

  const createdSharks = [];
  for (const s of sharksData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash,
        name: s.name,
        role: s.role,
        company: s.company,
        avatar: s.avatar,
        balance: s.balance,
        dealsClosed: s.dealsClosed,
      }
    });

    const shark = await prisma.shark.create({
      data: {
        userId: user.id,
        fundName: s.company,
        minTicket: s.minTicket,
        maxTicket: s.maxTicket,
        escrowBalance: s.escrowBalance
      }
    });
    createdSharks.push({ user, shark });
  }

  // 3. Create 10 Startups and 10 Founders
  const startupsData = [
    {
      name: 'Nexus AI',
      founderName: 'David Chen',
      email: 'david@nexus.ai',
      sector: 'AI & Data',
      stage: 'Seed',
      description: 'Autonomous ML systems for enterprise workflow intelligence.',
      fundingAsk: '$1,500,000',
      equityOffered: '10%',
      valuation: '$15,000,000',
      arr: '$2.2M',
      clients: '28 Fortune 500'
    },
    {
      name: 'Quantum Dynamics AI',
      founderName: 'Dr. Sophia Ray',
      email: 'sophia@quantumdynamics.ai',
      sector: 'AI & Data',
      stage: 'Series A',
      description: 'Quantum computing algorithms for real-time risk modeling.',
      fundingAsk: '$5,000,000',
      equityOffered: '10%',
      valuation: '$50,000,000',
      arr: '$4.1M',
      clients: '14 Global Banks'
    },
    {
      name: 'EcoTech Solutions',
      founderName: 'Liam Thorne',
      email: 'liam@ecotech.io',
      sector: 'CleanTech',
      stage: 'Seed',
      description: 'Next-generation carbon capture technology for heavy manufacturing.',
      fundingAsk: '$1,800,000',
      equityOffered: '10%',
      valuation: '$18,000,000',
      arr: '$1.1M',
      clients: '8 Industrial Plants'
    },
    {
      name: 'FinFlow Protocol',
      founderName: 'Nadia Patel',
      email: 'nadia@finflow.io',
      sector: 'FinTech',
      stage: 'Series B',
      description: 'Institutional cross-border payment liquidity layer.',
      fundingAsk: '$8,000,000',
      equityOffered: '10%',
      valuation: '$80,000,000',
      arr: '$9.5M',
      clients: '120 Fintechs'
    },
    {
      name: 'BioGen Innovations',
      founderName: 'Dr. Ethan Miller',
      email: 'ethan@biogen.health',
      sector: 'HealthTech',
      stage: 'Pre-Seed',
      description: 'AI-assisted gene editing therapeutics platform.',
      fundingAsk: '$900,000',
      equityOffered: '10%',
      valuation: '$9,000,000',
      arr: '$300K',
      clients: '3 Research Labs'
    },
    {
      name: 'CyberShield OS',
      founderName: 'Victor Vance',
      email: 'victor@cybershield.sec',
      sector: 'Cybersecurity',
      stage: 'Seed',
      description: 'Zero-trust runtime kernel defense for distributed cloud workloads.',
      fundingAsk: '$2,200,000',
      equityOffered: '12%',
      valuation: '$18,333,333',
      arr: '$1.8M',
      clients: '45 Cloud SaaS'
    },
    {
      name: 'RoboLogistics AI',
      founderName: 'Amara Okafor',
      email: 'amara@robologistics.ai',
      sector: 'AI & Data',
      stage: 'Seed',
      description: 'Autonomous micro-fulfillment robot fleet orchestration.',
      fundingAsk: '$3,000,000',
      equityOffered: '15%',
      valuation: '$20,000,000',
      arr: '$2.0M',
      clients: '15 Warehouses'
    },
    {
      name: 'SolarGrid Protocol',
      founderName: 'Carlos Gomez',
      email: 'carlos@solargrid.power',
      sector: 'CleanTech',
      stage: 'Series A',
      description: 'Peer-to-peer renewable energy trading network.',
      fundingAsk: '$4,000,000',
      equityOffered: '10%',
      valuation: '$40,000,000',
      arr: '$3.4M',
      clients: '35 Utilities'
    },
    {
      name: 'NeuroLink Health',
      founderName: 'Chloe Bennett',
      email: 'chloe@neurolink.med',
      sector: 'HealthTech',
      stage: 'Seed',
      description: 'Non-invasive neural interface for cognitive diagnostics.',
      fundingAsk: '$1,200,000',
      equityOffered: '8%',
      valuation: '$15,000,000',
      arr: '$600K',
      clients: '12 Clinics'
    },
    {
      name: 'HyperScale SaaS',
      founderName: 'Tariq Al-Mansoor',
      email: 'tariq@hyperscale.io',
      sector: 'B2B SaaS',
      stage: 'Seed',
      description: 'Automated database performance optimization for Postgres & Redis.',
      fundingAsk: '$2,000,000',
      equityOffered: '10%',
      valuation: '$20,000,000',
      arr: '$1.5M',
      clients: '80 Developers'
    }
  ];

  const createdStartups = [];
  for (const st of startupsData) {
    const user = await prisma.user.create({
      data: {
        email: st.email,
        passwordHash,
        name: st.founderName,
        role: 'FOUNDER',
        company: st.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.founderName)}`,
        balance: '$0',
        dealsClosed: 0
      }
    });

    const startup = await prisma.startup.create({
      data: {
        name: st.name,
        sector: st.sector,
        stage: st.stage,
        description: st.description,
        fundingAsk: st.fundingAsk,
        equityOffered: st.equityOffered,
        valuation: st.valuation,
        arr: st.arr,
        clients: st.clients
      }
    });

    await prisma.founder.create({
      data: {
        userId: user.id,
        startupId: startup.id,
        bio: `Founder & CEO of ${st.name}`
      }
    });

    createdStartups.push(startup);
  }

  // 4. Create Pitch Event & Pitch
  const nexusStartup = createdStartups[0];
  const quantumStartup = createdStartups[1];

  const liveEvent = await prisma.event.create({
    data: {
      title: 'Nexus AI Pitch Event',
      companyName: nexusStartup.name,
      pitchDeckUrl: '/decks/nexus-ai.pdf',
      liveStatus: 'LIVE',
      startupId: nexusStartup.id
    }
  });

  await prisma.pitch.create({
    data: {
      eventId: liveEvent.id,
      startupId: nexusStartup.id,
      totalCommitted: '$850K',
      percentageCommitted: 57.0,
      videoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop'
    }
  });

  // 5. Create Offers & Negotiations
  const offer1 = await prisma.offer.create({
    data: {
      startupId: quantumStartup.id,
      sharkId: createdSharks[0].shark.id,
      sharkName: 'Apex Ventures',
      amount: '$2,500,000',
      equity: '10%',
      valuation: '$25,000,000',
      terms: '1 Board Seat, Major Investor Pro-rata Rights',
      status: 'PENDING'
    }
  });

  const offer2 = await prisma.offer.create({
    data: {
      startupId: quantumStartup.id,
      sharkId: createdSharks[2].shark.id,
      sharkName: 'Silver Lake',
      amount: '$2,000,000',
      equity: '9%',
      valuation: '$22,000,000',
      terms: 'Board Observer Rights',
      status: 'PENDING'
    }
  });

  const offer3 = await prisma.offer.create({
    data: {
      startupId: quantumStartup.id,
      sharkId: createdSharks[1].shark.id,
      sharkName: 'Sarah Jenkins (Angel)',
      amount: '$500,000',
      equity: '2.5%',
      valuation: '$20,000,000',
      terms: 'Advisory Board Member',
      status: 'PENDING'
    }
  });

  // Active Negotiation Room
  const negotiation = await prisma.negotiation.create({
    data: {
      offerId: offer1.id,
      startupId: quantumStartup.id,
      sharkId: createdSharks[0].shark.id,
      status: 'ACTIVE',
      roomCode: 'ROOM-QUANTUM-101'
    }
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        negotiationId: negotiation.id,
        senderRole: 'Investor',
        senderName: 'Apex Ventures',
        text: "We're interested, but the valuation is a bit high. Can you do $4.5M for 12%?"
      },
      {
        negotiationId: negotiation.id,
        senderRole: 'Founder',
        senderName: 'Dr. Sophia Ray',
        text: "We're confident in our projections. How about $4.8M for 11%?"
      },
      {
        negotiationId: negotiation.id,
        senderRole: 'Investor',
        senderName: 'Apex Ventures',
        text: "Let me discuss with my partners."
      },
      {
        negotiationId: negotiation.id,
        senderRole: 'System',
        senderName: 'System',
        text: "New Offer Received from Apex Ventures: $4.5M for 12% Equity"
      }
    ]
  });

  // 6. Create Completed Deals
  await prisma.deal.createMany({
    data: [
      {
        startupId: nexusStartup.id,
        leadInvestor: 'Apex Ventures',
        dealSize: '$2.5M',
        valuation: '$25.0M',
        status: 'Closed'
      },
      {
        startupId: quantumStartup.id,
        leadInvestor: 'Silver Lake',
        dealSize: '$4.5M',
        valuation: '$37.5M',
        status: 'In Term Sheet'
      },
      {
        startupId: createdStartups[2].id,
        leadInvestor: 'Sequoia Growth',
        dealSize: '$1.8M',
        valuation: '$18.0M',
        status: 'Closed'
      }
    ]
  });

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'New Term Sheet Offer',
        message: 'Apex Ventures submitted $2.5M offer for Quantum Dynamics AI.',
        read: false,
        type: 'offer'
      },
      {
        title: 'Live Pitch Starting',
        message: 'Nexus AI is entering the live stage now.',
        read: false,
        type: 'event'
      },
      {
        title: 'Escrow Verification',
        message: 'Proof of funds confirmed for $12.5M capital line.',
        read: true,
        type: 'system'
      }
    ]
  });

  console.log('✅ VentureFlow Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
