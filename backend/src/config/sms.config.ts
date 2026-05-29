import { registerAs } from '@nestjs/config';

export default registerAs('sms', () => ({
  enabled: process.env.SMS_SEND_ENABLED === 'true',
  aliyunAccessKeyId: process.env.ALIYUN_SMS_ACCESS_KEY_ID ?? '',
  aliyunAccessKeySecret: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET ?? '',
  aliyunSignName: process.env.ALIYUN_SMS_SIGN_NAME ?? '',
  aliyunTemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE ?? '',
  aliyunEndpoint: process.env.ALIYUN_SMS_ENDPOINT ?? 'dypnsapi.aliyuncs.com',
  verificationCodeExpiresInSeconds: Number(
    process.env.SMS_VERIFICATION_CODE_EXPIRES_IN_SECONDS ?? 300,
  ),
}));
