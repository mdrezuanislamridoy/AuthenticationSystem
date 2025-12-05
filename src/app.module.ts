import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './lib/prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 30000,
        limit: 3,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MailerModule.forRoot({
      transport: {
        host: 'https://gmail.com',
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
