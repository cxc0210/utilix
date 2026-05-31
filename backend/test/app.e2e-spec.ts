import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ApiExceptionFilter } from './../src/common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './../src/common/interceptors/api-response.interceptor';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.REDIS_URL = '';
    process.env.SMS_SEND_ENABLED = 'false';
    process.env.SMS_VERIFICATION_CODE_EXPIRES_IN_SECONDS = '300';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new ApiExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer()).get('/api').expect(200).expect({
      code: 200,
      data: 'Hello World!',
      message: '',
    });
  });

  it('/api/auth/verification-code/send (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/verification-code/send')
      .send({ phone: '+8613812345678' })
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: {
            code: number;
            data: {
              expiresInSeconds: number;
              verificationCode: string;
            };
            message: string;
          };
        }) => {
          expect(body.code).toBe(200);
          expect(body.data.expiresInSeconds).toBe(300);
          expect(body.data.verificationCode).toMatch(/^\d{6}$/);
          expect(body.message).toBe('');
        },
      );
  });

  it('/api/auth/verification-code/send (POST) returns formatted errors', () => {
    return request(app.getHttpServer())
      .post('/api/auth/verification-code/send')
      .send({ phone: '+8612312345678' })
      .expect(400)
      .expect({
        code: 400,
        data: {},
        message: 'phone must be a +86 mainland China mobile number',
      });
  });
});
