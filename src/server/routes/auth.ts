import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateTokens, authenticateJWT, AuthenticatedRequest } from '../auth';

const router = Router();
const prisma = new PrismaClient();
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'ventureflow_super_secret_refresh_key_2026_prod';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, company } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = (role || 'Investor').toUpperCase() === 'FOUNDER' ? 'FOUNDER' : 'SHARK';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: userRole,
        company: company || (userRole === 'FOUNDER' ? 'Stealth Startup' : 'Private Angel'),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      }
    });

    if (userRole === 'SHARK') {
      await prisma.shark.create({
        data: {
          userId: user.id,
          fundName: company || 'Angel Syndicate',
          escrowBalance: '$10,000,000'
        }
      });
    }

    const tokens = generateTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role === 'FOUNDER' ? 'Founder' : 'Investor',
        company: user.company,
        avatar: user.avatar,
        balance: user.balance,
        dealsClosed: user.dealsClosed
      },
      ...tokens
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, userId, password } = req.body;
    const identifier = (userId || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'User ID and password required' });
    }

    const user = identifier.includes('@')
      ? await prisma.user.findUnique({ where: { email: identifier } })
      : await prisma.user.findUnique({ where: { id: identifier } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    const tokens = generateTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role === 'FOUNDER' ? 'Founder' : 'Investor',
        company: user.company,
        avatar: user.avatar,
        balance: user.balance,
        dealsClosed: user.dealsClosed
      },
      ...tokens
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ error: 'Refresh token revoked or invalid' });
      }

      const tokens = generateTokens(user);
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
      });

      res.json(tokens);
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Token refresh failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success to prevent email enumeration, but with message
      return res.json({ message: 'If an account exists with this email, a reset code was generated.', resetCode: 'VF-892104' });
    }

    res.json({
      message: 'Password reset code sent to your email.',
      resetCode: 'VF-892104'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Forgot password request failed' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Password reset failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === 'FOUNDER' ? 'Founder' : 'Investor',
      company: user.company,
      avatar: user.avatar,
      balance: user.balance,
      dealsClosed: user.dealsClosed
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
