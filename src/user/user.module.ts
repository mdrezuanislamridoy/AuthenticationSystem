import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '@/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from '@/lib/guards/jwt/jwt.guard';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, JwtService, JwtGuard],
})
export class UserModule {}
