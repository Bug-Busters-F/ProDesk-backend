/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { ReadAllTicketUseCase } from './readAll.usecase';
import { UserRole } from '../../../../shared/enums/user.enum';

describe('ReadAllTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: ReadAllTicketUseCase;
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'titulo do ticket',
      category: 'bi',
      description: 'descricao do ticket',
      clientId: randomUUID(),
    });

    repository = {
      readAll: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new ReadAllTicketUseCase(repository);
  });

  it('should read all ticket successfully', async () => {
    repository.readAll.mockResolvedValue([ticket]);

    const output = await useCase.execute({
      userId: randomUUID(),
      role: UserRole.SUPPORT,
    });

    expect(output).toBeDefined();
    expect(Array.isArray(output)).toBe(true);
    expect(output[0].id).toBe(ticket.id);

    expect(repository.readAll).toHaveBeenCalledTimes(1);

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
  });

  it('should read all tickets with clientId filter', async () => {
    repository.readAll.mockResolvedValue([ticket]);
    const output = await useCase.execute({
      userId: ticket.clientId,
      role: UserRole.CLIENT,
    });
    expect(output).toBeDefined();
    expect(Array.isArray(output)).toBe(true);
    expect(output[0].clientId).toBe(ticket.clientId);
    expect(repository.readAll).toHaveBeenCalledWith({
      clientId: ticket.clientId,
    });

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
  });
});
