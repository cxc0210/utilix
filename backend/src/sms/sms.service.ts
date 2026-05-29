import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $OpenApiUtil } from '@alicloud/openapi-core';
import Dypnsapi20170525, {
  SendSmsVerifyCodeRequest,
} from '@alicloud/dypnsapi20170525';

export type SendVerificationCodeResult = {
  provider: 'aliyun';
  sent: boolean;
  requestId?: string;
  skippedReason?: 'disabled' | 'missing-config';
};

@Injectable()
export class SmsService {
  private aliyunClient?: Dypnsapi20170525;

  constructor(private readonly configService: ConfigService) {}

  async sendVerificationCode(
    phone: string,
    code: string,
  ): Promise<SendVerificationCodeResult> {
    const signName = this.configService.get<string>('sms.aliyunSignName', '');
    const templateCode = this.configService.get<string>(
      'sms.aliyunTemplateCode',
      '',
    );

    if (!this.configService.get<boolean>('sms.enabled', false)) {
      return {
        provider: 'aliyun',
        sent: false,
        skippedReason: 'disabled',
      };
    }

    if (!this.isAliyunConfigured(signName, templateCode)) {
      return {
        provider: 'aliyun',
        sent: false,
        skippedReason: 'missing-config',
      };
    }

    const expiresInSeconds = this.configService.get<number>(
      'sms.verificationCodeExpiresInSeconds',
      60,
    );
    console.log(
      `Sending SMS to ${phone} with code ${code} that expires in ${expiresInSeconds} seconds`,
    );
    console.log({
      aliyunConfig: {
        accessKeyId: this.configService.get<string>('sms.aliyunAccessKeyId'),
        accessKeySecret: this.configService.get<string>(
          'sms.aliyunAccessKeySecret',
        ),
        signName,
        templateCode,
      },
    });
    const response = await this.getAliyunClient().sendSmsVerifyCode(
      new SendSmsVerifyCodeRequest({
        countryCode: '86',
        phoneNumber: this.toMainlandPhoneNumber(phone),
        signName,
        templateCode,
        templateParam: JSON.stringify({
          code,
          min: Math.ceil(expiresInSeconds / 60).toString(),
        }),
        validTime: expiresInSeconds,
        codeLength: code.length,
      }),
    );

    if (response.body?.code !== 'OK' || response.body.success === false) {
      throw new BadGatewayException(
        response.body?.message ?? 'Failed to send SMS',
      );
    }

    return {
      provider: 'aliyun',
      sent: true,
      requestId: response.body.model?.requestId ?? response.body.requestId,
    };
  }

  private isAliyunConfigured(signName: string, templateCode: string) {
    return Boolean(
      this.configService.get<string>('sms.aliyunAccessKeyId') &&
      this.configService.get<string>('sms.aliyunAccessKeySecret') &&
      signName &&
      templateCode,
    );
  }

  private getAliyunClient() {
    if (this.aliyunClient) {
      return this.aliyunClient;
    }

    this.aliyunClient = new Dypnsapi20170525(
      new $OpenApiUtil.Config({
        accessKeyId: this.configService.getOrThrow<string>(
          'sms.aliyunAccessKeyId',
        ),
        accessKeySecret: this.configService.getOrThrow<string>(
          'sms.aliyunAccessKeySecret',
        ),
        endpoint: this.configService.get<string>(
          'sms.aliyunEndpoint',
          'dypnsapi.aliyuncs.com',
        ),
      }),
    );

    return this.aliyunClient;
  }

  private toMainlandPhoneNumber(phone: string) {
    return phone.replace(/^\+86/, '');
  }
}
