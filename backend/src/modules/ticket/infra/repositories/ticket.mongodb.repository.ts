import { Model, Types } from 'mongoose';
import { Ticket, TicketStatus } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repository/ticket.repository.interface';
import {
  TicketLean,
  TicketMetrics,
  TicketMetricsRaw,
  TicketSchemaClass,
} from '../schemas/ticket.mongo.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketAggregateBuilder } from '../helpers/ticket.aggregate.builder';

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        {
          $set: {
            ...raw,
            category:
              typeof raw.category === 'string'
                ? raw.category
                : raw.category?.id,
          },
        },
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
    search?: string;
    status?: TicketStatus;
    escalationLevel?: number;
    onlyMine?: boolean;
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

    if (filters?.search) {
      matchStage = {
        ...matchStage,
        $or: [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ],
      };
    }

    if (filters?.status) {
      matchStage = { ...matchStage, status: filters.status };
    }

    if (filters?.escalationLevel) {
      matchStage = { ...matchStage, escalationLevel: filters.escalationLevel };
    }

    if (filters?.onlyMine && filters?.agentId) {
      matchStage = { ...matchStage, agentId: filters.agentId };
    }

    const tickets = await this.ticketModel.aggregate([
      { $match: matchStage },
      ...TicketAggregateBuilder.buildAggregate(),
    ]);

    return tickets.map((t: TicketLean) => TicketMapper.toDomain(t));
  }

  async readById(id: string): Promise<Ticket | null> {
    const result = await this.ticketModel
      .aggregate([
        { $match: { _id: id } },
        { $limit: 1 },
        ...TicketAggregateBuilder.buildAggregate(),
      ])
      .exec();

    if (!result.length) return null;

    const foundedTicket = TicketMapper.toDomain(result[0] as TicketLean);

    console.log('Founded ticket:', foundedTicket);

    return foundedTicket;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ticketModel.findByIdAndDelete(id);
    return result !== null;
  }

  async getMetrics(filters?: {
    role?: string;
    categories?: string[];
    categoryId?: string;
  }): Promise<TicketMetrics | null> {
    const matchStage: any = {};

    if (filters?.role === 'support' && filters?.categories) {
      if (filters?.categoryId && filters.categories.includes(filters.categoryId)) {
        matchStage.category = filters.categoryId;
      } else {
        matchStage.category = {
          $in: filters.categories,
        };
      }
    } else if (filters?.role === 'admin' && filters?.categoryId) {
      matchStage.category = filters.categoryId;
    }

    const basePipeline = TicketAggregateBuilder.buildMetrics();
    const pipeline = Object.keys(matchStage).length > 0 
      ? [{ $match: matchStage }, ...basePipeline] 
      : basePipeline;

    const result = await this.ticketModel
      .aggregate<TicketMetricsRaw>(pipeline)
      .exec();

    if (!result.length) return null;

    const rawMetrics = result[0];

    const total = rawMetrics.total[0]?.total ?? 0;

    if (total <= 0) return null;

    const toMap = (
      arr: { _id: string; count: number }[],
    ): Record<string, number> =>
      arr.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

    return {
      total,
      byStatus: toMap(rawMetrics.byStatus),
      avgResolutionTime: rawMetrics.avgResolutionTime[0] ?? {
        count: 0,
        avgHours: 0,
        avgMinutes: 0,
        avgDays: 0,
      },
    };
  }
}
