import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '@/lib/strategies/jwt.strategy';
import { JwtGuard } from '@/lib/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtGuard, JwtService],
})
export class AuthModule {}
