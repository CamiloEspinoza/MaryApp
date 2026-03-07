import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { randomInt } from 'crypto';

const OTP_EXPIRY_MINUTES = 10;
const OTP_RATE_LIMIT_SECONDS = 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
  ) {}

  async sendOtp(emailAddress: string): Promise<{ message: string }> {
    const email = emailAddress.toLowerCase().trim();

    // Rate limit: check last OTP sent to this email
    const recent = await this.prisma.otp.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - OTP_RATE_LIMIT_SECONDS * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recent) {
      throw new BadRequestException(
        'Espera un momento antes de solicitar otro código',
      );
    }

    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Find or prepare user reference
    const user = await this.prisma.user.findUnique({ where: { email } });

    await this.prisma.otp.create({
      data: {
        code,
        email,
        userId: user?.id ?? null,
        expiresAt,
      },
    });

    await this.email.sendOtp(email, code);

    this.logger.log(`OTP sent to ${email}`);
    return { message: 'Código enviado' };
  }

  async verifyOtp(
    emailAddress: string,
    code: string,
  ): Promise<{ token: string; user: { id: string; email: string; name: string | null } }> {
    const email = emailAddress.toLowerCase().trim();

    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        code,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Mark OTP as used
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    // Upsert user (create if first login)
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // Link OTP to user if it wasn't linked
    if (!otp.userId) {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { userId: user.id },
      });
    }

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
