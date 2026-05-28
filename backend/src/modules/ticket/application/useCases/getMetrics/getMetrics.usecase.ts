import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { TicketStatus } from '../../../domain/entities/ticket.entity';

export interface GetMetricsOutput {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  escalatedTickets: number;
  closedTickets: number;
  averageResolutionTime: {
    count: number;
    avgHours: number;
    avgMinutes: number;
    avgDays: number;
  };
}

@Injectable()
export class GetMetricsUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(): Promise<GetMetricsOutput> {
    const metrics = await this.repository.getMetrics();
    if (!metrics) {
      return {
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        escalatedTickets: 0,
        closedTickets: 0,
        averageResolutionTime: {
          count: 0,
          avgHours: 0,
          avgMinutes: 0,
          avgDays: 0,
        },
      };
    }

    return {
      totalTickets: metrics.total,
      openTickets: metrics.byStatus[TicketStatus.OPEN] || 0,
      inProgressTickets: metrics.byStatus[TicketStatus.IN_PROGRESS] || 0,
      escalatedTickets: metrics.byStatus[TicketStatus.ESCALATED] || 0,
      closedTickets: metrics.byStatus[TicketStatus.CLOSED] || 0,
      averageResolutionTime: metrics.avgResolutionTime,
    };
  }
}
