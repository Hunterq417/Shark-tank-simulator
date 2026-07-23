import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../admin/activity-log.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { toPublicUser } from '../common/utils/user.mapper';
import { RefreshTokenPayload } from './interfaces/jwt-payload.interface';

/**
 * Demo/event mode: this platform is meant to be walked up to and used instantly
 * (hackathons, demo days, classrooms) without a pre-registration step. Any email
 * signs in with this password — existing users too, on top of their real password.
 */
const DEMO_PASSWORD = 'password123';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly activityLog: ActivityLogService,
  ) {}

  private get refreshSecret() {
    return this.config.get<string>('REFRESH_SECRET', 'ventureflow_super_secret_refresh_key_2026_prod');
  }

  private get accessExpiresIn() {
    return this.config.get<string>('JWT_EXPIRES_IN', '1d');
  }

  private get refreshExpiresIn() {
    return this.config.get<string>('REFRESH_EXPIRES_IN', '7d');
  }

  private async issueTokens(user: { id: string; email: string; role: string; name: string; company?: string | null }) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role, name: user.name, company: user.company },
      { expiresIn: this.accessExpiresIn as any },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id } as RefreshTokenPayload,
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn as any },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = dto.role === 'FOUNDER' ? 'FOUNDER' : 'SHARK';

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role,
        company: dto.company || (role === 'FOUNDER' ? 'Stealth Startup' : 'Private Angel'),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.name)}`,
      },
    });

    if (role === 'SHARK') {
      await this.prisma.shark.create({
        data: {
          userId: user.id,
          fundName: dto.company || 'Angel Syndicate',
          escrowBalance: '$10,000,000',
        },
      });
    }

    const tokens = await this.issueTokens(user);
    await this.activityLog.record('USER_REGISTERED', `${user.email} registered as ${role}`, user.id);
    return { user: toPublicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const identifier = dto.userId.trim();
    const isEmail = identifier.includes('@');

    let user = isEmail
      ? await this.prisma.user.findUnique({ where: { email: identifier } })
      : await this.prisma.user.findUnique({ where: { id: identifier } });

    if (!user) {
      // Unknown email + the demo password auto-provisions a fresh Shark account,
      // so anyone can walk up and log in without registering first.
      if (!isEmail || dto.password !== DEMO_PASSWORD) {
        throw new UnauthorizedException('Invalid user ID or password');
      }
      user = await this.autoProvision(identifier);
    } else if (dto.password !== DEMO_PASSWORD) {
      const isValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Invalid user ID or password');
      }
    }

    const tokens = await this.issueTokens(user);
    await this.activityLog.record('USER_LOGIN', `${user.email} logged in`, user.id);
    return { user: toPublicUser(user), ...tokens };
  }

  private async autoProvision(email: string) {
    const name = email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || 'Guest Investor';

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'SHARK',
        company: 'Private Angel',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      },
    });

    await this.prisma.shark.create({
      data: {
        userId: user.id,
        fundName: 'Angel Syndicate',
        escrowBalance: '$10,000,000',
      },
    });

    await this.activityLog.record('USER_AUTO_PROVISIONED', `${email} auto-created via demo sign-in`, user.id);
    return user;
  }

  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token revoked or invalid');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token revoked or invalid');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Always respond the same way to avoid leaking whether the email is registered.
    if (!user) {
      return { message: 'If an account exists with this email, a reset code was generated.' };
    }

    const code = `VF-${randomInt(100000, 999999)}`;
    const resetCode = await bcrypt.hash(code, 10);
    const resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetCode, resetCodeExpiresAt },
    });

    return {
      message: 'Password reset code generated. Check your email for the code.',
      // Surfaced directly since this project has no email delivery integration.
      resetCode: code,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.resetCode || !user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
      throw new BadRequestException('Reset code is invalid or has expired');
    }

    const codeMatches = await bcrypt.compare(dto.code, user.resetCode);
    if (!codeMatches) {
      throw new BadRequestException('Reset code is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetCode: null, resetCodeExpiresAt: null, refreshTokenHash: null },
    });

    return { message: 'Password reset successfully. You can now log in.' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toPublicUser(user);
  }
}
