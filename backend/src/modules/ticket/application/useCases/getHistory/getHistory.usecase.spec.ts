/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import {
  Ticket,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { GetHistoryTicketUseCase } from './getHistory.usecase';

describe('GetHistoryTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: GetHistoryTicketUseCase;
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'titulo do ticket',
      category: 'iot',
      description: 'descricao do ticket',
      clientId: randomUUID(),
    });

    repository = {
      readById: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new GetHistoryTicketUseCase(repository);
  });

  it('should read a history of a ticket by id successfully', async () => {
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id);

    expect(output).toBeDefined();
    expect(output.id).toBe(ticket.id);
    expect(Array.isArray(output.history)).toBe(true);
    expect(output.history[0].status).toBe(TicketStatus.OPEN);

    expect(repository.readById).toHaveBeenCalledTimes(1);
    expect(repository.readById).toHaveBeenCalledWith(ticket.id);

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
  });
});
