import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: process.env.OAUTH_CLIENT as string,
      clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
      callbackURL: 'http://localhost:9999/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;

    let user = await this.prisma.client.user.findFirst({
      where: {
        email: emails[0].value,
      },
    });

    if (!user) {
      user = await this.prisma.client.user.create({
        data: {
          full_name: profile.displayName,
          email: emails[0].value,
          role: 'student',
          profilePicture: photos[0].value,
        },
      });
    } else {
      user = await this.prisma.client.user.update({
        where: { id: user.id },
        data: {
          full_name: profile.displayName,
          email: emails[0].value,
          role: 'student',
          profilePicture: photos[0].value,
        },
      });
    }
    const accessToken = this.jwtService.sign(
      { id: user.id, email: user.email, role: user.role },
      {
        secret: (process.env.JWT_SECRET as string) || 'jsjlaiajf',
        expiresIn: '1h',
      },
    );

    done(null, { user, accessToken });
  }
}
