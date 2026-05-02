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

    return await this.readById(updated._id);
  }

  async readAll(filters?: {
    clientId?: string;
    agentId?: string;
    categories?: string[];
  }): Promise<Ticket[]> {
    let matchStage: Record<string, unknown> = {};

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

    const tickets = await this.ticketModel
      .aggregate<TicketLean>([
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            let: { agentIdStr: '$agentId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$agentIdStr' }],
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
              id: { $arrayElemAt: ['$agentData._id', 0] },
              name: { $arrayElemAt: ['$agentData.name', 0] },
            },
          },
        },
        { $project: { agentData: 0 } },
      ])
      .exec();
    return tickets.map((t) => TicketMapper.toDomain(t));
  }

  async readById(id: string): Promise<Ticket | null> {
    const [result]: TicketLean[] = await this.ticketModel
      .aggregate<TicketLean>([
        { $match: { _id: id } },
        {
          $lookup: {
            from: 'users',
            let: { agentIdStr: '$agentId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$agentIdStr' }],
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
              id: { $arrayElemAt: ['$agentData._id', 0] },
              name: { $arrayElemAt: ['$agentData.name', 0] },
            },
          },
        },
        { $project: { agentData: 0 } },
      ])
      .exec();

    if (!result) return null;
    console.log('Result from readById in repository:', result);

    return TicketMapper.toDomain(result);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ticketModel.findByIdAndDelete(id);
    return result !== null;
  }
}
