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
import { User, UserDocument, UserRole } from '../../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TicketSchemaClass, TicketDocument } from '../../ticket/infra/schemas/ticket.mongo.schema';

@Injectable()
export class ChatService {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
    @InjectModel(TicketSchemaClass.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

  // ADICIONADOS attachmentUrl E type NA ASSINATURA DO MÉTODO
  async sendMessage(
    chatId: string,
    senderId: string,
    senderRole: UserRole,
    content: string,
    fileIds?: string[],
    attachmentUrl?: string, 
    type?: string           
  ): Promise<any> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // ADMINs podem enviar mensagem em qualquer chat
    if (senderRole !== UserRole.ADMIN) {
      if (chat.clientId !== senderId && chat.agentId !== senderId) {
        throw new ForbiddenException('You are not a participant of this chat');
      }
    }

    // PASSANDO OS NOVOS CAMPOS PARA O REPOSITÓRIO
    return this.messageRepository.create({
      chatId,
      senderId,
      content,
      isSystemMessage: false,
      fileIds: fileIds || [],
      attachmentUrl: attachmentUrl, 
      type: type || 'TEXT',         
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
    if (userRole !== UserRole.ADMIN) {
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

  async updateAgentByTicketId(ticketId: string, agentId: string | null): Promise<ChatDetails | null> {
    return this.chatRepository.updateAgent(ticketId, agentId);
  }

  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) {
      return false;
    }
    
    if (chat.clientId === userId || chat.agentId === userId) {
      return true;
    }

    // Se o chat está na "Fila Aberta" (Sem dono)
    if (!chat.agentId) {
      const user = await this.userModel.findById(userId).exec();
      const ticket = await this.ticketModel.findById(chat.ticketId).exec();

      if (user && ticket) {
        if (user.role === UserRole.ADMIN) {
          return true;
        }

        if (user.role === UserRole.SUPPORT) {
          const hasCategory = user.categories.some(
            (cat) => cat.toString() === ticket.category.toString()
          );

          if (hasCategory && (user.level || 1) >= ticket.escalationLevel) {
            return true;
          }
        }
      }
    }

    return false;
  }
}