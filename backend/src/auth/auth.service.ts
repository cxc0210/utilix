import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly smsService: SmsService,
  ) {}

  generateVerificationCode(phone: unknown) {
    if (typeof phone !== 'string' || phone.trim().length === 0) {
      throw new BadRequestException('phone is required');
    }

    const normalizedPhone = phone.trim();

    if (!/^\+861[3-9]\d{9}$/.test(normalizedPhone)) {
      throw new BadRequestException(
        'phone must be a +86 mainland China mobile number',
      );
    }

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
    await this.smsService.sendVerificationCode(phone, code);
  }
}
