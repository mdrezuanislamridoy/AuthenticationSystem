import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUser } from './dto/register-user-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtGuard } from '@/lib/guards/jwt/jwt.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('send-signup-code')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  sendSignupCode(@Body() { email }: { email: string }) {
    return this.userService.sendSignupCode(email);
  }

  @Post('resend-signup-code')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  resendSignupCode(@Body() { email }: { email: string }) {
    return this.userService.sendSignupCode(email);
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  verifyEmail(@Body() data: { email: string; verificationCode: string }) {
    return this.userService.verifySignupCode(data);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('profile'))
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  registerUser(
    @Body() data: RegisterUser,
    @UploadedFile() profile: Express.Multer.File,
  ) {
    return this.userService.register(data, profile);
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  profile(@Req() req: Request) {
    return this.userService.profile(req);
  }

  @Post('reset-password-code')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  resetPasswordCode(@Body() data: { email: string }) {
    return this.userService.resetPasswordCode(data.email);
  }
  @Post('verify-reset-code')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  verifyResetCode(@Body() data: { email: string; verificationCode: string }) {
    return this.userService.verifyResetCode(data);
  }

  @Patch('reset-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  resetPassword(@Body() data: { email: string; password: string }) {
    return this.userService.resetPassword(data);
  }
}
