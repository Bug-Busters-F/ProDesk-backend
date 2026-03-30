import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface ReadAllTicketOutput {
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

export class ReadAllTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(): Promise<ReadAllTicketOutput[]> {
    const foundedTickets = await this.repository.readAll();

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
        groupId: primitive.groupId,
        escalationLevel: primitive.escalationLevel,
        createdAt: primitive.createdAt,
        updatedAt: primitive.updatedAt,
        closedAt: primitive.closedAt,
      };
    });

    return convertedTickets;
  }
}
