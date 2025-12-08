import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(
    body: {
      conversationId: string;
      message: string;
    },
    userId: string,
  ) {
    const { conversationId, message } = body;

    const isConversation = await this.prisma.client.conversation.findUnique({
      where: {
        id: conversationId,
        participents: {
          some: {
            userId,
          },
        },
      },
    });

    if (!isConversation) {
      throw new NotFoundException('no conversation found ');
    }

    const newMessage = await this.prisma.client.message.create({
      data: {
        conversationId,
        senderId: userId,
        message,
      },
    });
    return newMessage;
  }

  async getMessages(conversationId: string, userId: string) {
    const isConversation = await this.prisma.client.conversation.findUnique({
      where: {
        id: conversationId,
        participents: {
          some: {
            userId,
          },
        },
      },
    });
    if (!isConversation) {
      throw new NotFoundException('no conversation found ');
    }

    const messages = await this.prisma.client.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
    return messages;
  }

  getConversationParticipants(conversationId: string) {
    return this.prisma.client.participant.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
  }
}
