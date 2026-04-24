import { Injectable } from '@nestjs/common';
import { Ticket } from '../entities/ticket.entity';

@Injectable()
export abstract class ITicketRepository {
  abstract create(ticket: Ticket): Promise<Ticket>;
  abstract save(ticket: Ticket): Promise<Ticket | null>;
  abstract readAll(filters?: { clientId?: string }): Promise<Ticket[]>;
  abstract readById(id: string): Promise<Ticket | null>;
  abstract delete(id: string): Promise<boolean>;
}
