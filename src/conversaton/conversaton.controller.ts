import { JwtGuard } from './../lib/guards/jwt/jwt.guard';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConversatonService } from './conversaton.service';

import { CurrentUser } from '@/lib/decorators/user.decorator';

@Controller('conversaton')
export class ConversatonController {
  constructor(private readonly conversatonService: ConversatonService) {}
  @Post('create')
  @UseGuards(JwtGuard)
  async createConversation(
    @Body() body: { senderId: string; receiverId: string },
  ) {
    return this.conversatonService.createConversation(body);
  }

  @Get('/:id')
  @UseGuards(JwtGuard)
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; email: string },
  ) {
    console.log(user);

    return this.conversatonService.getConversation(id, user.sub);
  }

  @Post('create-group')
  @UseGuards(JwtGuard)
  async createGroupConversation(
    @Body()
    body: {
      name: string;
      groupMenmbers: string[];
    },
    @CurrentUser() user: { sub: string; email: string },
  ) {
    return this.conversatonService.createGroupCoversation(
      body.name,
      user.sub,
      body.groupMenmbers,
    );
  }
}
