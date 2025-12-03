import {
  Body,
  Controller,
  Get,
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
import { JwtGuard } from '@/lib/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('send-signup-code')
  sendSignupCode(@Body() { email }: { email: string }) {
    return this.userService.sendSignupCode(email);
  }

  @Post('resend-signup-code')
  resendSignupCode(@Body() { email }: { email: string }) {
    return this.userService.sendSignupCode(email);
  }

  @Post('verify-email')
  verifyEmail(@Body() data: { email: string; verificationCode: string }) {
    return this.userService.verifySignupCode(data);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('profile'))
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
}
