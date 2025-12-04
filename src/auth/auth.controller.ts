import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { Request } from 'express';
import { JwtGuard } from '@/lib/guards/jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() data: LoginDto, @Req() req: Request) {
    return this.authService.login(data, req);
  }

  @Get('active-devices')
  @UseGuards(JwtGuard)
  getActiveDevices(@Req() req: Request) {
    return this.authService.getActiveDevices(req);
  }

  @Post('remove-all-session')
  @UseGuards(JwtGuard)
  removeAllSession(@Req() req: Request) {
    return this.authService.removeAllSession(req);
  }

  @Post('remove-session/:id')
  @UseGuards(JwtGuard)
  removeSession(@Param('id') id: string) {
    return this.authService.removeSession(id);
  }
}
