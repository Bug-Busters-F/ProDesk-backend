import { Injectable } from '@nestjs/common';
import { Ticket } from '../entities/tickect.entity';

@Injectable()
export abstract class ITicketRepository {
  abstract create(ticket: Ticket): Promise<Ticket>;
  // abstract save(ticket: Ticket): Promise<Ticket>;
  // abstract update(ticket: Ticket): Promise<Ticket>;
  abstract readAll(filter?: any): Promise<Ticket[]>;
  abstract readById(id: string): Promise<Ticket | null>;
  abstract delete(id: string): Promise<boolean>;
}
