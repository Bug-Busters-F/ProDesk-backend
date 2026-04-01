import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TicketCategory } from '../../domain/entities/ticket.entity';

export class EscalateTicketRequest {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  category: TicketCategory;
}
