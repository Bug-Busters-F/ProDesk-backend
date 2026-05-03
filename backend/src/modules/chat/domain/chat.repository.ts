import { ChatDetails, ChatStatus } from './chat.entity';

export interface IChatRepository {
  create(data: {
    ticketId: string;
    clientId: string;
    agentId: string;
    groupId: string;
  }): Promise<ChatDetails>;
  findById(id: string): Promise<ChatDetails | null>;
  findByParticipant(userId: string): Promise<ChatDetails[]>;
  findByTicketId(ticketId: string): Promise<ChatDetails | null>;
  updateStatus(id: string, status: ChatStatus): Promise<ChatDetails | null>;
  updateAgent(ticketId: string, agentId: string | null): Promise<ChatDetails | null>;
}