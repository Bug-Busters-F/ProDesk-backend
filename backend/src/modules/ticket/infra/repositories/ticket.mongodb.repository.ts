import { Model, QueryFilter } from 'mongoose';
import { Ticket } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repository/ticket.repository.interface';
import { TicketLean, TicketSchemaClass } from '../schemas/ticket.mongo.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TicketMapper } from '../mappers/ticket.mapper';

export class TicketMongoRepository extends ITicketRepository {
  constructor(
    @InjectModel(TicketSchemaClass.name)
    private readonly ticketModel: Model<TicketSchemaClass>,
  ) {
    super();
  }

  async create(ticket: Ticket): Promise<Ticket> {
    const raw = TicketMapper.toPersistence(ticket);
    const created = await this.ticketModel.create(raw);
    return TicketMapper.toDomain(created);
  }

  async save(ticket: Ticket): Promise<Ticket | null> {
    const raw = TicketMapper.toPersistence(ticket);
    const updated = await this.ticketModel
      .findOneAndUpdate(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { _id: raw._id },
        { $set: raw },
        { returnDocument: 'after' },
      )
      .lean<TicketLean>()
      .exec();

    if (!updated) {
      return null;
    }

    return TicketMapper.toDomain(updated);
  }

  async readAll(filters?: {
    clientId?: string;
    agentId?: string;
    categoryId?: string;
  }): Promise<Ticket[]> {
    let query: QueryFilter<TicketSchemaClass> = {};

    if (filters?.agentId) {
      query = {
        $or: [
          { agentId: filters.agentId },
          { category: filters.categoryId, agentId: null },
        ],
      };
    } else if (filters?.clientId) {
      query = { clientId: filters.clientId };
    }

    const tickets = await this.ticketModel.find(query).exec();
    return tickets.map((t) => TicketMapper.toDomain(t));
  }

  async readById(id: string): Promise<Ticket | null> {
    const foundedTicket = await this.ticketModel
      .findById(id)
      .lean<TicketLean>()
      .exec();

    if (!foundedTicket) return null;

    return TicketMapper.toDomain(foundedTicket);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ticketModel.findByIdAndDelete(id);
    return result !== null;
  }
}
