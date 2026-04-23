import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { IChatRepository } from '../domain/chat.repository';
import type { IMessageRepository } from '../../Messages/domain/message.repository';
import type { ChatDetails } from '../domain/chat.entity';
import { ChatStatus } from '../domain/chat.entity';
import { UserRole } from '../../user/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
  ) {}

  async createChat(
    ticketId: string,
    clientId: string,
    agentId: string,
    groupId: string,
  ): Promise<ChatDetails> {
    return this.chatRepository.create({ ticketId, clientId, agentId, groupId });
  }

  async getChatById(chatId: string): Promise<ChatDetails> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  async getChatsByUser(userId: string): Promise<ChatDetails[]> {
    return this.chatRepository.findByParticipant(userId);
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    senderRole: UserRole,
    content: string,
    fileIds?: string[],
  ): Promise<any> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // ADMINs podem enviar mensagem em qualquer chat
    if (senderRole !== UserRole.ADMIN && senderRole !== UserRole.SUPPORT) {
      if (chat.clientId !== senderId && chat.agentId !== senderId) {
        throw new ForbiddenException('You are not a participant of this chat');
      }
    }

    return this.messageRepository.create({
      chatId,
      senderId,
      content,
      isSystemMessage: false,
      fileIds: fileIds || [],
    });
  }

  async getChatHistory(
    chatId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<any[]> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // ADMINs podem ver histórico de qualquer chat
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPPORT) {
      if (chat.clientId !== userId && chat.agentId !== userId) {
        throw new ForbiddenException('You are not a participant of this chat');
      }
    }

    return this.messageRepository.findByChatId(chatId);
  }

  async closeChat(chatId: string): Promise<ChatDetails> {
    const result = await this.chatRepository.updateStatus(
      chatId,
      ChatStatus.CLOSED,
    );
    if (!result) {
      throw new NotFoundException('Chat not found');
    }
    return result;
  }

  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) {
      return false;
    }
    return chat.clientId === userId || chat.agentId === userId;
  }
}
