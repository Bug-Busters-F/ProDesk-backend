import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  TicketStatus,
  TicketEvents,
} from '../../domain/entities/ticket.entity';

export class GetHistoryFiltersRequest {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  responsibleAgent?: string;

  @IsOptional()
  @IsEnum(TicketEvents)
  event?: TicketEvents;

  @IsOptional()
  @IsDateString()
  fromDate?: Date;
}
