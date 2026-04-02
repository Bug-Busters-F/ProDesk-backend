import { Injectable } from '@nestjs/common';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface ReadByIdTicketOutput {
  id: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  clientId: string;
  status: TicketStatus;
  agentId: string | null;
  groupId: string | null;
  escalationLevel: number;
  createdAt: Date;
  updatedAt: Date | null;
  closedAt: Date | null;
}

@Injectable()
export class ReadByIdTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(id: string): Promise<ReadByIdTicketOutput> {
    const foundedTicket = await this.repository.readById(id);

    if (!foundedTicket) {
      throw new Error('Ticket not founded.');
    }

    const primitive = foundedTicket.toPrimitives();

    return {
      id: primitive._id,
      title: primitive.title,
      category: primitive.category,
      priority: primitive.priority,
      description: primitive.description,
      clientId: primitive.clientId,
      status: primitive.status,
      agentId: primitive.agentId,
      groupId: primitive.groupId,
      escalationLevel: primitive.escalationLevel,
      createdAt: primitive.createdAt,
      updatedAt: primitive.updatedAt,
      closedAt: primitive.closedAt,
    };
  }
}
