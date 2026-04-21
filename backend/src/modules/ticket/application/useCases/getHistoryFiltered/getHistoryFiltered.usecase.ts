import { Injectable } from '@nestjs/common';
import {
  TicketEvents,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface TicketHistoryEntryOutput {
  event: TicketEvents;
  responsibleAgent: string | null;
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
    event: TicketEvents,
    filters: {
      status?: TicketStatus;
      responsibleAgent?: string;
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

    if (filters.responsibleAgent) {
      history = history.filter(
        (entry) => entry.responsibleAgent === filters.responsibleAgent,
      );
    }

    if (filters.event) {
      history = history.filter((entry) => entry.event === filters.event);
    }

    if (filters.fromDate) {
      history = history.filter((entry) => entry.occurredAt >= filters.fromDate);
    }

    return {
      id: foundTicket.id,
      history: [...history],
    };
  }
}
