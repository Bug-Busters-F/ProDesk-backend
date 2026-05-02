import { Injectable } from '@nestjs/common';
import {
  AgentField,
  TicketEvents,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface TicketHistoryEntryOutput {
  event: TicketEvents;
  responsibleAgent: AgentField | null;
  status: TicketStatus;
  message: string;
  solution?: string | null;
  occurredAt: Date;
}

export interface GetHistoryTicketOutput {
  id: string;
  history: TicketHistoryEntryOutput[];
}

@Injectable()
export class GetHistoryFilteredUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(
    id: string,
    filters: {
      status?: TicketStatus;
      responsibleAgentId?: string;
      event?: TicketEvents;
      fromDate?: Date;
    },
  ): Promise<GetHistoryTicketOutput> {
    const foundTicket = await this.repository.readById(id);

    if (!foundTicket) {
      throw new Error('Ticket not found');
    }

    let history = foundTicket.history;

    if (filters.status) {
      history = history.filter((entry) => entry.status === filters.status);
    }

    if (filters.responsibleAgentId) {
      history = history.filter(
        (entry) => entry.responsibleAgent?.id === filters.responsibleAgentId,
      );
    }

    if (filters.event) {
      history = history.filter((entry) => entry.event === filters.event);
    }

    if (filters.fromDate) {
      const fromDate = filters.fromDate;
      history = history.filter((entry) => entry.occurredAt >= fromDate);
    }

    return {
      id: foundTicket.id,
      history: history.map((entry) => ({
        ...entry,
        responsibleAgent: entry.responsibleAgent
          ? { id: entry.responsibleAgent.id, name: entry.responsibleAgent.name }
          : null,
      })),
    };
  }
}
