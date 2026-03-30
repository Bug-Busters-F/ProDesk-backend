/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { Ticket, TicketCategory } from '../../../domain/entities/ticket.entity';
import { ReadAllTicketUseCase } from './readById.usecase';

describe('ReadByIdTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: ReadAllTicketUseCase;
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'titulo do ticket',
      category: TicketCategory.IOT,
      description: 'descricao do ticket',
      clientId: randomUUID(),
    });

    repository = {
      readById: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new ReadAllTicketUseCase(repository);
  });

  it('should read a ticket by id successfully', async () => {
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id);

    expect(output).toBeDefined();
    expect(output.id).toBe(ticket.id);

    expect(repository.readById).toHaveBeenCalledTimes(1);
    expect(repository.readById).toHaveBeenCalledWith(ticket.id);

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
  });
});
