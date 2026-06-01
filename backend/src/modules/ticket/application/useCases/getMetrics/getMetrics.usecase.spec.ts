import { describe, it, expect, beforeEach } from '@jest/globals';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { TicketStatus } from '../../../domain/entities/ticket.entity';
import { GetMetricsOutput, GetMetricsUseCase } from './getMetrics.usecase';

const mockRepository = {
  getMetrics: jest.fn(),
} as unknown as ITicketRepository;

describe('GetMetricsUseCase', () => {
  let useCase: GetMetricsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetMetricsUseCase(mockRepository);
  });

  it('Should return all zeros when repository returns null', async () => {
    jest.spyOn(mockRepository, 'getMetrics').mockResolvedValue(null);

    const result: GetMetricsOutput = await useCase.execute();

    expect(result.totalTickets).toBe(0);
    expect(result.openTickets).toBe(0);
    expect(result.inProgressTickets).toBe(0);
    expect(result.escalatedTickets).toBe(0);
    expect(result.closedTickets).toBe(0);
  });

  it('Should map metrics correctly when repository returns data', async () => {
    jest.spyOn(mockRepository, 'getMetrics').mockResolvedValue({
      total: 10,
      byStatus: {
        [TicketStatus.OPEN]: 4,
        [TicketStatus.IN_PROGRESS]: 3,
        [TicketStatus.ESCALATED]: 2,
        [TicketStatus.CLOSED]: 1,
      },
    });

    const result: GetMetricsOutput = await useCase.execute();

    expect(result.totalTickets).toBe(10);
    expect(result.openTickets).toBe(4);
    expect(result.inProgressTickets).toBe(3);
    expect(result.escalatedTickets).toBe(2);
    expect(result.closedTickets).toBe(1);
  });

  it('Should return 0 for statuses not present in byStatus', async () => {
    jest.spyOn(mockRepository, 'getMetrics').mockResolvedValue({
      total: 2,
      byStatus: {
        [TicketStatus.OPEN]: 2,
      },
    });

    const result: GetMetricsOutput = await useCase.execute();

    expect(result.totalTickets).toBe(2);
    expect(result.openTickets).toBe(2);
    expect(result.inProgressTickets).toBe(0);
    expect(result.escalatedTickets).toBe(0);
    expect(result.closedTickets).toBe(0);
  });
});
