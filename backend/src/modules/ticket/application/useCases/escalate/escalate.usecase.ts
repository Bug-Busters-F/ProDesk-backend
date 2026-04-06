import { Injectable } from '@nestjs/common';
import {
  TicketPriority,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface EscalateTicketInput {
  id: string;
  groupId: string;
  category: string;
}

export interface EscalateTicketOutput {
  id: string;
  title: string;
  category: string;
  priority: TicketPriority;
  description: string;
  clientId: string;
  status: TicketStatus;
  agentId: string | null;
  groupId: string | null;
  escalationLevel: number;
  createdAt: Date;
  updatedAt: Date | null;
}

@Injectable()
export class EscalateTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(input: EscalateTicketInput): Promise<EscalateTicketOutput> {
    const foundedTicket = await this.repository.readById(input.id);

    if (!foundedTicket) {
      throw new Error('Ticket not found');
    }

    foundedTicket.escalate(input.groupId, input.category);

    const escalatedTicket = await this.repository.save(foundedTicket);

    if (!escalatedTicket) {
      throw new Error('Ticket not escalated');
    }

    const primitive = escalatedTicket.toPrimitives();

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
    };
  }
}
