import { Ticket } from '../../domain/entities/tickect.entity';
import { ITicketRepository } from '../../domain/repository/ticket.repository.interface';

export class TicketMongoRepository extends ITicketRepository {
  //   constructor(private readonly mongoServer: )

  create(ticket: Ticket): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }
  save(ticket: Ticket): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }
  update(ticket: Ticket): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }
  findAll(filter?: any): Promise<Ticket[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<Ticket | null> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): boolean {
    throw new Error('Method not implemented.');
  }
}
