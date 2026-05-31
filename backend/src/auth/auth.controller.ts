import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateVerificationCodeDto } from './dto/generate-verification-code.dto';
import { VerifyPhoneLoginDto } from './dto/verify-phone-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verification-code/send')
  @HttpCode(200)
  async sendVerificationCode(@Body() body: GenerateVerificationCodeDto) {
    const verificationCode = this.authService.generateVerificationCode(
      body.phone,
    );

    return this.authService.sendVerificationCode(
      verificationCode.phone,
      verificationCode.code,
      verificationCode.expiresInSeconds,
    );
  }

  @Post('phone-login')
  @HttpCode(200)
  async verifyPhoneLogin(@Body() body: VerifyPhoneLoginDto) {
    return this.authService.verifyPhoneLogin(body.phone, body.code);
  }
}
