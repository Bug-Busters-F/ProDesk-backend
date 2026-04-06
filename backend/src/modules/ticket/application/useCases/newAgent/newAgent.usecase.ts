import { Injectable } from '@nestjs/common';
import { TicketStatus } from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export interface NewAgentTicketInput {
  id: string;
  agentId: string;
}

export interface NewAgentTicketOutput {
  id: string;
  agentId: string | null;
  status: TicketStatus;
}

@Injectable()
export class NewAgentTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(input: NewAgentTicketInput): Promise<NewAgentTicketOutput> {
    const foundedTicket = await this.repository.readById(input.id);

    if (!foundedTicket) {
      throw new Error('Ticket not found.');
    }

    foundedTicket.assignToAgent(input.agentId);

    const updatedTicket = await this.repository.save(foundedTicket);

    if (!updatedTicket) {
      throw new Error('Fail to update ticket.');
    }

    return {
      id: updatedTicket.id,
      agentId: updatedTicket.agentId,
      status: updatedTicket.status,
    };
  }
}
