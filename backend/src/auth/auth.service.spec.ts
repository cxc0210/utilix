import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  const configService = {
    get: jest.fn((key: string, defaultValue?: number) => {
      if (key === 'sms.verificationCodeExpiresInSeconds') {
        return 300;
      }

      return defaultValue;
    }),
  };

  const prismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const redisService = {
    setVerificationCode: jest.fn(),
    getVerificationCode: jest.fn(),
    deleteVerificationCode: jest.fn(),
  };

  const smsService = {
    sendVerificationCode: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: SmsService,
          useValue: smsService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('throws when verification code is missing or incorrect', async () => {
    redisService.getVerificationCode.mockResolvedValue('123456');

    await expect(
      authService.verifyPhoneLogin('+8613812345678', '654321'),
    ).rejects.toThrow(new BadRequestException('验证码错误'));
  });

  it('returns the existing user when phone and code match', async () => {
    const user = {
      id: 1001,
      phone: '+8613812345678',
      email: null,
      account: null,
      nickname: null,
      avatar: null,
      status: 1,
      createdAt: new Date('2026-05-31T07:00:00.000Z'),
      updatedAt: new Date('2026-05-31T07:00:00.000Z'),
    };

    redisService.getVerificationCode.mockResolvedValue('123456');
    prismaService.user.findUnique.mockResolvedValue(user);

    await expect(
      authService.verifyPhoneLogin('+8613812345678', '123456'),
    ).resolves.toEqual(user);

    expect(prismaService.user.create).not.toHaveBeenCalled();
    expect(redisService.deleteVerificationCode).toHaveBeenCalledWith(
      '+8613812345678',
    );
  });

  it('returns the verification code when sms sending is disabled', async () => {
    smsService.sendVerificationCode.mockResolvedValue({
      provider: 'aliyun',
      sent: false,
      skippedReason: 'disabled',
    });

    await expect(
      authService.sendVerificationCode('+8613812345678', '123456', 300),
    ).resolves.toEqual({
      expiresInSeconds: 300,
      verificationCode: '123456',
    });

    expect(redisService.setVerificationCode).toHaveBeenCalledWith(
      '+8613812345678',
      '123456',
      300,
    );
  });

  it('creates a new user when phone and code match but user does not exist', async () => {
    const user = {
      id: 1002,
      phone: '+8613812345678',
      email: null,
      account: null,
      nickname: null,
      avatar: null,
      status: 1,
      createdAt: new Date('2026-05-31T07:00:00.000Z'),
      updatedAt: new Date('2026-05-31T07:00:00.000Z'),
    };

    redisService.getVerificationCode.mockResolvedValue('123456');
    prismaService.user.findUnique.mockResolvedValue(null);
    prismaService.user.create.mockResolvedValue(user);

    await expect(
      authService.verifyPhoneLogin('+8613812345678', '123456'),
    ).resolves.toEqual(user);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        phone: '+8613812345678',
      },
    });
    expect(redisService.deleteVerificationCode).toHaveBeenCalledWith(
      '+8613812345678',
    );
  });
});
