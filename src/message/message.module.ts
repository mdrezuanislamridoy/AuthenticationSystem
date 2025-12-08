import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [MessageController],
  providers: [MessageService, JwtService],
})
export class MessageModule {}
