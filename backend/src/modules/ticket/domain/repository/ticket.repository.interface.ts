import { Injectable } from '@nestjs/common';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { TicketMetrics } from '../../infra/schemas/ticket.mongo.schema';

@Injectable()
export abstract class ITicketRepository {
  abstract create(ticket: Ticket): Promise<Ticket>;
  abstract save(ticket: Ticket): Promise<Ticket | null>;
  abstract readAll(filters?: {
    clientId?: string;
    agentId?: string;
    categories?: string[];
    search?: string;
    status?: TicketStatus;
    escalationLevel?: number;
    onlyMine?: boolean;
  }): Promise<Ticket[]>;
  abstract readById(id: string): Promise<Ticket | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract getMetrics(filters?: {
    role?: string;
    categories?: string[];
    categoryId?: string;
  }): Promise<TicketMetrics | null>;
}
