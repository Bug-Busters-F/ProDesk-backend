import { Model } from 'mongoose';
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
    categories?: string[];
  }): Promise<Ticket[]> {
    let matchStage: Record<string, any> = {};

    if (filters?.agentId) {
      matchStage = {
        $or: [
          { agentId: filters.agentId },
          { category: { $in: filters.categories ?? [] }, agentId: null },
        ],
      };
    } else if (filters?.clientId) {
      matchStage = { clientId: filters.clientId };
    }

    // const tickets = await this.ticketModel.find(query).exec();

    const tickets = await this.ticketModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          let: { agentId: '$agentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$$agentId', null] },
                    { $eq: [{ $toString: '$_id' }, '$$agentId'] },
                  ],
                },
              },
            },
          ],
          as: 'agentData',
        },
      },
      {
        $addFields: {
          agent: {
            $cond: {
              if: { $gt: [{ $size: '$agentData' }, 0] },
              then: {
                id: { $toString: { $arrayElemAt: ['$agentData._id', 0] } },
                name: { $arrayElemAt: ['$agentData.name', 0] },
              },
              else: null,
            },
          },
        },
      },
      { $unset: ['agentData', 'agentId', '__v'] },
    ]);

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
