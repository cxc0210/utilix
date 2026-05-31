import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly smsService: SmsService,
  ) {}

  generateVerificationCode(phone: unknown) {
    const normalizedPhone = this.normalizePhone(phone);

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

    return {
      phone: normalizedPhone,
      code,
      expiresInSeconds: this.configService.get<number>(
        'sms.verificationCodeExpiresInSeconds',
        300,
      ),
    };
  }

  async sendVerificationCode(
    phone: string,
    code: string,
    expiresInSeconds: number,
  ) {
    await this.redisService.setVerificationCode(phone, code, expiresInSeconds);
    const result = await this.smsService.sendVerificationCode(phone, code);

    return {
      expiresInSeconds,
      verificationCode: result.skippedReason === 'disabled' ? code : undefined,
    };
  }

  async verifyPhoneLogin(phone: unknown, code: unknown) {
    const normalizedPhone = this.normalizePhone(phone);
    const normalizedCode = this.normalizeVerificationCode(code);
    const savedCode =
      await this.redisService.getVerificationCode(normalizedPhone);

    if (!savedCode || savedCode !== normalizedCode) {
      throw new BadRequestException('验证码错误');
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      await this.redisService.deleteVerificationCode(normalizedPhone);
      return existingUser;
    }

    const createdUser = await this.prismaService.user.create({
      data: {
        phone: normalizedPhone,
      },
    });

    await this.redisService.deleteVerificationCode(normalizedPhone);

    return createdUser;
  }

  private normalizePhone(phone: unknown) {
    if (typeof phone !== 'string' || phone.trim().length === 0) {
      throw new BadRequestException('phone is required');
    }

    const normalizedPhone = phone.trim();

    if (!/^\+861[3-9]\d{9}$/.test(normalizedPhone)) {
      throw new BadRequestException(
        'phone must be a +86 mainland China mobile number',
      );
    }

    return normalizedPhone;
  }

  private normalizeVerificationCode(code: unknown) {
    if (typeof code !== 'string' || code.trim().length === 0) {
      throw new BadRequestException('验证码错误');
    }

    const normalizedCode = code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new BadRequestException('验证码错误');
    }

    return normalizedCode;
  }
}
