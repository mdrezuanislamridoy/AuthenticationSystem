import bcrypt from 'bcrypt';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/LoginDto';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { User } from '@prisma';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(data: LoginDto) {
    try {
      const user = await this.prisma.client.user.findFirst({
        where: {
          email: data.email,
        },
      });
      if (!user) {
        throw new NotFoundException('Account not found');
      }

      if (!user.password) {
        throw new ForbiddenException(
          'This account may be made by google authentication',
        );
      }

      const isPassValid = await bcrypt.compare(data.password, user.password);

      if (!isPassValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const { password, ...result } = user;

      const tokens = this.generateToken(user);

      return {
        message: 'User logged in successfully',
        result,
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      //   throw new HttpException(error, HttpStatus.BAD_REQUEST);
      console.log(error);
    }
  }

  private generateToken(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: (process.env.JWT_SECRET as string) || 'jsjlaiajf',
        expiresIn: '1h',
      },
    );
  }

  private generateRefreshToken(user: User) {
    return this.jwtService.sign(
      { sub: user.id },
      {
        secret: (process.env.JWT_REFRESH as string) || 'refresh_jldalkf',
        expiresIn: '7d',
      },
    );
  }
}
