import { Injectable } from '@nestjs/common';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { UserRole } from '../../../../shared/enums/user.enum';

export interface ReadAllTicketOutput {
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
  closedAt: Date | null;
}

@Injectable()
export class ReadAllTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(input: {
    userId: string;
    categories?: string[];
    role: UserRole;
  }): Promise<ReadAllTicketOutput[]> {
    const filters =
      input.role === UserRole.CLIENT
        ? { clientId: input.userId }
        : input.role === UserRole.SUPPORT
          ? { agentId: input.userId, categories: input.categories }
          : undefined;

    const foundedTickets = await this.repository.readAll({ ...filters });

    const convertedTickets = foundedTickets.map((t: Ticket) => {
      const primitive = t.toPrimitives();

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
        closedAt: primitive.closedAt,
      };
    });

    return convertedTickets;
  }
}
