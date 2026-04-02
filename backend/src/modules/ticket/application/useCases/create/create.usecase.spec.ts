/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { CreateTicketInput, CreateTicketUseCase } from './create.usecase';

describe('CreateTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: CreateTicketUseCase;
  const input: CreateTicketInput = {
    title: 'titulo do ticket',
    category: TicketCategory.IOT,
    description: 'descricao do ticket',
    clientId: randomUUID(),
  };

  beforeEach(() => {
    const ticket = Ticket.create(input);

    repository = {
      create: jest.fn().mockResolvedValue(ticket),
    };

    useCase = new CreateTicketUseCase(repository);
  });

  it('Should exec usecase successfully and return the ticket', async () => {
    const output = await useCase.execute(input);

    expect(output).toBeDefined();
    expect(typeof output._id).toBe('string');
    expect(output.status).toBe(TicketStatus.OPEN);
    expect(output.createdAt).toBeInstanceOf(Date);

    expect(repository.create).toHaveBeenCalledTimes(1);

    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('close');
    expect(output).not.toHaveProperty('assignToAgent');
    expect(output).not.toHaveProperty('create');
    expect(output).not.toHaveProperty('restore');
    expect(output).not.toHaveProperty('toPrimitives');
  });
});
