import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL ?? '',
  verificationCodeKeyPrefix:
    process.env.REDIS_VERIFICATION_CODE_KEY_PREFIX ?? 'verification_code:',
}));
