import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client?: Redis;

  constructor(private readonly configService: ConfigService) {}

  async setVerificationCode(
    phone: string,
    code: string,
    expiresInSeconds: number,
  ) {
    if (!this.isEnabled()) {
      return;
    }

    await this.getClient().set(
      this.getVerificationCodeKey(phone),
      code,
      'EX',
      expiresInSeconds,
    );
  }

  async getVerificationCode(phone: string) {
    if (!this.isEnabled()) {
      return null;
    }

    return this.getClient().get(this.getVerificationCodeKey(phone));
  }

  async onModuleDestroy() {
    if (!this.client) {
      return;
    }

    await this.client.quit();
  }

  private isEnabled() {
    return Boolean(this.configService.get<string>('redis.url'));
  }

  private getClient() {
    if (this.client) {
      return this.client;
    }

    this.client = new Redis(
      this.configService.getOrThrow<string>('redis.url'),
      {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      },
    );

    return this.client;
  }

  private getVerificationCodeKey(phone: string) {
    const prefix = this.configService.get<string>(
      'redis.verificationCodeKeyPrefix',
      'verification_code:',
    );

    return `${prefix}${phone}`;
  }
}
