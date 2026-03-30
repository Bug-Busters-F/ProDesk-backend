import { ChatDetails, ChatStatus } from './chat.entity.js';

export interface IChatRepository {
  create(data: {
    ticketId: string;
    clientId: string;
    attendantId: string;
  }): Promise<ChatDetails>;

  findById(id: string): Promise<ChatDetails | null>;

  findByParticipant(userId: string): Promise<ChatDetails[]>;

  findByTicketId(ticketId: string): Promise<ChatDetails | null>;

  updateStatus(id: string, status: ChatStatus): Promise<ChatDetails | null>;
}
