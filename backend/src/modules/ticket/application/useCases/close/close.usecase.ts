import { Injectable } from '@nestjs/common';
import {
  TicketPriority,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface CloseTicketInput {
  id: string;
  solution: string;
}

export interface CloseTicketOutput {
  id: string;
  title: string;
  category: string;
  priority: TicketPriority;
  description: string;
  clientId: string;
  status: TicketStatus;
  agentId: string | null;
  escalationLevel: number;
  createdAt: Date;
  updatedAt: Date | null;
}

@Injectable()
export class CloseTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(input: CloseTicketInput): Promise<CloseTicketOutput> {
    const foundedTicket = await this.repository.readById(input.id);

    if (!foundedTicket) {
      throw new Error('Ticket not found');
    }

    // regra de negócio
    foundedTicket.close(input.solution);

    const closedTicket = await this.repository.save(foundedTicket);

    if (!closedTicket) {
      throw new Error('Ticket not closed');
    }

    const primitive = closedTicket.toPrimitives();

    return {
      id: primitive._id,
      title: primitive.title,
      category: primitive.category,
      priority: primitive.priority,
      description: primitive.description,
      clientId: primitive.clientId,
      status: primitive.status,
      agentId: primitive.agentId,
      escalationLevel: primitive.escalationLevel,
      createdAt: primitive.createdAt,
      updatedAt: primitive.updatedAt,
    };
  }
}