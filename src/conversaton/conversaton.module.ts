import { Module } from '@nestjs/common';
import { ConversatonService } from './conversaton.service';
import { ConversatonController } from './conversaton.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ConversatonController],
  providers: [ConversatonService, JwtService],
})
export class ConversatonModule {}
