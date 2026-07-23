import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let config: any;
  let activityLog: any;

  const baseUser = {
    id: 'user-1',
    email: 'founder@ventureflow.io',
    name: 'Jordan Blake',
    role: 'FOUNDER',
    company: 'Stealth Startup',
    avatar: 'https://avatar',
    balance: '$0',
    dealsClosed: 0,
    passwordHash: '',
    refreshTokenHash: null,
    resetCode: null,
    resetCodeExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    baseUser.passwordHash = await bcrypt.hash('Str0ngPassword!', 10);

    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      shark: { create: jest.fn() },
    };
    jwt = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
      verifyAsync: jest.fn(),
    };
    config = { get: jest.fn((_key: string, fallback?: string) => fallback) };
    activityLog = { record: jest.fn() };

    service = new AuthService(prisma, jwt, config, activityLog);
  });

  describe('register', () => {
    it('throws ConflictException if the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);

      await expect(
        service.register({ email: baseUser.email, password: 'x', name: 'x' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates a SHARK user and its Shark record by default', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ ...baseUser, role: 'SHARK' });
      prisma.user.update.mockResolvedValue({ ...baseUser, role: 'SHARK' });

      const result = await service.register({
        email: 'shark@ventureflow.io',
        password: 'Str0ngPassword!',
        name: 'Alex Shark',
      } as any);

      expect(prisma.shark.create).toHaveBeenCalled();
      expect(result.user.role).toBe('Investor');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for an unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ userId: 'nobody@x.com', password: 'x' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      await expect(
        service.login({ userId: baseUser.email, password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns tokens and the display-mapped role for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      prisma.user.update.mockResolvedValue(baseUser);

      const result = await service.login({ userId: baseUser.email, password: 'Str0ngPassword!' });

      expect(result.user.role).toBe('Founder');
      expect(result.accessToken).toBe('signed.jwt.token');
    });

    it('auto-provisions a new Shark account for an unknown email using the demo password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ ...baseUser, id: 'new-user', email: 'walkup@demo.io', role: 'SHARK' });
      prisma.user.update.mockResolvedValue({ ...baseUser, id: 'new-user', role: 'SHARK' });

      const result = await service.login({ userId: 'walkup@demo.io', password: 'password123' });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.shark.create).toHaveBeenCalled();
      expect(result.user.role).toBe('Investor');
    });

    it('rejects an unknown non-email identifier even with the demo password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ userId: 'not-an-email', password: 'password123' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('lets the demo password override an existing user real password', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      prisma.user.update.mockResolvedValue(baseUser);

      const result = await service.login({ userId: baseUser.email, password: 'password123' });

      expect(result.accessToken).toBe('signed.jwt.token');
    });
  });

  describe('me', () => {
    it('throws NotFoundException when the user no longer exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.me('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
