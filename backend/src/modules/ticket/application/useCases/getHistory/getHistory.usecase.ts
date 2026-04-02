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
export class GetHistoryTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(id: string): Promise<GetHistoryTicketOutput> {
    const foundedTicket = await this.repository.readById(id);

    if (!foundedTicket) {
      throw new Error('Ticket not founded');
    }

    return {
      id: foundedTicket.id,
      history: [...foundedTicket.history],
    };
  }
}
