/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { EscalateTicketInput, EscalateTicketUseCase } from './escalate.usecase';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';

describe('EscalateTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: EscalateTicketUseCase;
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'titulo do ticket',
      category: TicketCategory.BI,
      description: 'descricao do ticket',
      clientId: randomUUID(),
    });

    repository = {
      readById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new EscalateTicketUseCase(repository);
  });

  it('should escalate ticket successfully', async () => {
    const input: EscalateTicketInput = {
      id: ticket.id,
      groupId: randomUUID(),
      category: TicketCategory.IOT,
    };

    ticket.assignToAgent(randomUUID());

    repository.readById.mockResolvedValue(ticket);

    // eslint-disable-next-line @typescript-eslint/require-await
    repository.save.mockImplementation(async (t: Ticket) => t);

    const output = await useCase.execute(input);

    expect(output).toBeDefined();
    expect(output.id).toBe(ticket.id);
    expect(output.status).toBe(TicketStatus.ESCALATED);
    expect(output.escalationLevel).toBe(2);
    expect(output.updatedAt).toBeInstanceOf(Date);

    expect(repository.readById).toHaveBeenCalledWith(input.id);
    expect(repository.save).toHaveBeenCalledWith(expect.any(Ticket));

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
  });
});
