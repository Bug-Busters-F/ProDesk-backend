import { Injectable } from '@nestjs/common';
import { Ticket, TicketStatus } from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { TriageService } from '../../../../triage/application/triage.service';

export interface CreateTicketInput {
  title: string;
  description: string;
  clientId: string;
}

export interface CreateTicketOutput {
  _id: string;
  title: string;
  category: string;
  description: string;
  clientId: string;
  fileUrls: string[];
  status: TicketStatus;
  createdAt: Date;
}

@Injectable()
export class CreateTicketUseCase {
  constructor(
    private readonly repository: ITicketRepository,
    private readonly triageService: TriageService,
  ) {}

  async execute(input: CreateTicketInput): Promise<CreateTicketOutput> {
    const triageResult = await this.triageService.classify(input.description);

    const ticket = Ticket.create({
      ...input,
      category: triageResult.category,
    });

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
