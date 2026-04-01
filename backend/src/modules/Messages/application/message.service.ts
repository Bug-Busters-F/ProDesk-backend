import { Injectable } from '@nestjs/common';
import { MessageRepositoryMongodb } from '../infra/message.repository.mongodb';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepositoryMongodb) {}

  async getChatHistory(chatId: string) {
    return this.messageRepository.findByChatId(chatId);
  }
}