/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import {
  Ticket,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { NewAgentTicketUseCase } from './newAgent.usecase';

describe('NewAgentTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: NewAgentTicketUseCase;
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'titulo do ticket',
      category: 'bi',
      description: 'descricao do ticket',
      clientId: randomUUID(),
    });

    repository = {
      readById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new NewAgentTicketUseCase(repository);
  });

  it('should assing a new agent to a ticket successfully', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    repository.readById.mockResolvedValue(ticket);

    ticket.assignToAgent(input.agentId);
    repository.save.mockResolvedValue(ticket);

    const output = await useCase.execute(input);

    expect(output).toBeDefined();
    expect(output.id).toBe(ticket.id);
    expect(output.agentId).toBe(input.agentId);
    expect(output.status).toBe(TicketStatus.IN_PROGRESS);

    expect(repository.readById).toHaveBeenCalledTimes(1);
    expect(repository.readById).toHaveBeenCalledWith(input.id);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(ticket);

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
  });
});
