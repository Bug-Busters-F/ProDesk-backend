import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import {
  Ticket,
  TicketEvents,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { GetHistoryFilteredUseCase } from './getHistoryFiltered.usecase';

describe('GetHistoryFilteredUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: GetHistoryFilteredUseCase;
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

    useCase = new GetHistoryFilteredUseCase(repository);
  });

  it('should return full history when no filters are provided', async () => {
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(
      ticket.id,
      TicketEvents.OPEN_NEW_TICKET,
      {},
    );

    expect(output).toBeDefined();
    expect(output.id).toBe(ticket.id);
    expect(Array.isArray(output.history)).toBe(true);
    expect(output.history).toHaveLength(1);
    expect(output.history[0].status).toBe(TicketStatus.OPEN);

    expect(repository.readById).toHaveBeenCalledTimes(1);
    expect(repository.readById).toHaveBeenCalledWith(ticket.id);
  });

  it('should filter history by status', async () => {
    ticket.assignToAgent(randomUUID());
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {
      status: TicketStatus.IN_PROGRESS,
    });

    expect(
      output.history.every((e) => e.status === TicketStatus.IN_PROGRESS),
    ).toBe(true);
    expect(output.history).toHaveLength(1);
  });

  it('should filter history by responsibleAgent', async () => {
    const agentId = randomUUID();
    ticket.assignToAgent(agentId);
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {
      responsibleAgentId: agentId,
    });

    expect(
      output.history.every((e) => e.responsibleAgent?.id === agentId),
    ).toBe(true);
    expect(output.history).toHaveLength(1);
  });

  it('should filter history by event', async () => {
    ticket.assignToAgent(randomUUID());
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {
      event: TicketEvents.NEW_AGENT,
    });

    expect(
      output.history.every((e) => e.event === TicketEvents.NEW_AGENT),
    ).toBe(true);
    expect(output.history).toHaveLength(1);
  });

  it('should filter history by fromDate', async () => {
    const before = new Date(Date.now() - 10000);
    ticket.assignToAgent(randomUUID());
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {
      fromDate: before,
    });

    expect(output.history.every((e) => e.occurredAt >= before)).toBe(true);
    expect(output.history.length).toBeGreaterThanOrEqual(1);
  });

  it('should return empty history when fromDate is in the future', async () => {
    const future = new Date(Date.now() + 99999999);
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {
      fromDate: future,
    });

    expect(output.history).toHaveLength(0);
  });

  it('should combine multiple filters correctly', async () => {
    const agentId = randomUUID();
    const before = new Date(Date.now() - 10000);
    ticket.assignToAgent(agentId);
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {
      status: TicketStatus.IN_PROGRESS,
      responsibleAgentId: agentId,
      event: TicketEvents.NEW_AGENT,
      fromDate: before,
    });

    expect(output.history).toHaveLength(1);
    expect(output.history[0].status).toBe(TicketStatus.IN_PROGRESS);
    expect(output.history[0].responsibleAgent?.id).toBe(agentId);
    expect(output.history[0].event).toBe(TicketEvents.NEW_AGENT);
  });
  it('should return empty history when no entries match filters', async () => {
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {
      status: TicketStatus.CLOSED,
    });

    expect(output.history).toHaveLength(0);
  });

  it('should throw when ticket is not found', async () => {
    repository.readById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', {})).rejects.toThrow(
      'Ticket not found',
    );

    expect(repository.readById).toHaveBeenCalledWith('non-existent-id');
  });

  it('should not expose domain methods in output', async () => {
    repository.readById.mockResolvedValue(ticket);

    const output = await useCase.execute(ticket.id, {});

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
    expect(output).not.toHaveProperty('close');
  });
});
