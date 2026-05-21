import { Injectable } from '@nestjs/common';
import {
  AgentField,
  ClientField,
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
  client: ClientField | null;
  status: TicketStatus;
  escalationLevel: number;
  createdAt: Date;
  updatedAt: Date | null;
  closedAt: Date | null;
  agent?: AgentField | null;
}

@Injectable()
export class ReadAllTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(input: {
    userId: string;
    categories?: string[];
    role: UserRole;
    search?: string;
    status?: TicketStatus;
    escalationLevel?: number;
    onlyMine?: boolean;
  }): Promise<ReadAllTicketOutput[]> {
    const filters =
      input.role === UserRole.CLIENT
        ? { clientId: input.userId }
        : input.role === UserRole.SUPPORT
          ? { agentId: input.userId, categories: input.categories }
          : undefined;

    const foundedTickets = await this.repository.readAll({
      ...filters,
      search: input.search,
      status: input.status,
      escalationLevel: input.escalationLevel,
      onlyMine: input.onlyMine,
    });

    const convertedTickets = foundedTickets.map((t) => {
      const primitive = t.toPrimitives();

      return {
        id: primitive._id,
        title: primitive.title,
        category: primitive.category,
        priority: primitive.priority,
        description: primitive.description,
        client: primitive.client,
        status: primitive.status,
        escalationLevel: primitive.escalationLevel,
        createdAt: primitive.createdAt,
        updatedAt: primitive.updatedAt,
        closedAt: primitive.closedAt,
        agent: primitive.agent,
      };
    });

    return convertedTickets;
  }
}
