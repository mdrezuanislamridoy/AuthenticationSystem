import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ origin: '*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: MessageService) {}

  @WebSocketServer() server: Server;

  connectedUsers = new Map<string, Set<string>>();

  async handleConnection(client: any) {
    let bearerToken = client.handshake.headers.authorization as string;

    if (!bearerToken) bearerToken = client.handshake.auth?.token;

    if (!bearerToken) bearerToken = client.handshake.query.token as string;

    let token = bearerToken.startsWith('Bearer ')
      ? bearerToken?.split(' ')[1]
      : bearerToken;

    if (!token) throw new UnauthorizedException('Token not provided');

    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const userId = user.sub;

    if (!userId) throw new UnauthorizedException('Invalid token');

    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(client.id);

    client.data.userId = userId;
  }

  async handleDisconnect(client: any) {
    const userId = client.data.userId;

    const clientUserSet = this.connectedUsers.get(userId);
    if (clientUserSet) {
      clientUserSet.delete(client.id);
      if (clientUserSet.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  //Direct message
  @SubscribeMessage('join-conversation')
  async joinConversation(client: Socket, payload: { conversationId: string }) {
    const userId = client.data.userId;
    if (!userId) throw new UnauthorizedException();

    await client.join(payload.conversationId);
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    client: Socket,
    payload: { conversationId: string; message: string },
  ) {
    const userId = client.data.userId;
    if (!userId) throw new UnauthorizedException();

    const message = await this.chatService.sendMessage(payload, userId);

    this.server.to(payload.conversationId).emit('receive-message', message);
  }

  //Group message
  @SubscribeMessage('join-group')
  async joinGroup(client: Socket, payload: { conversation: string }) {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    await client.join(payload.conversation);
  }

  @SubscribeMessage('send-group-message')
  async sendGroupMessage(
    client: Socket,
    payload: {
      conversationId: string;
      message: string;
    },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const message = await this.chatService.sendMessage(payload, userId);

    this.server
      .to(payload.conversationId)
      .emit('receive-group-message', message);
  }
}
