import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface CreateTicketInput {
  title: string;
  category: TicketCategory;
  description: string;
  clientId: string;
}

export interface CreateTicketOutput {
  _id: string;
  title: string;
  category: TicketCategory;
  description: string;
  clientId: string;
  fileUrls: string[];
  status: TicketStatus;
  createdAt: Date;
}

export class CreateTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async exec(input: CreateTicketInput): Promise<CreateTicketOutput> {
    const ticket = Ticket.create(input);

    const created = await this.repository.create(ticket);
    const primitives = created.toPrimitives();

    return {
      _id: primitives._id,
      title: primitives.title,
      category: primitives.category,
      description: primitives.description,
      clientId: primitives.clientId,
      fileUrls: primitives.fileUrls,
      status: primitives.status,
      createdAt: primitives.createdAt,
    };
  }
}
