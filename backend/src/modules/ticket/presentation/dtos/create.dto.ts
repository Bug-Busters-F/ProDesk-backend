import { IsNotEmpty, IsString } from 'class-validator';
import { TicketCategory } from '../../domain/entities/ticket.entity';

export class CreateTicketRequest {
  @IsString()
  title: string;

  @IsString()
  category: TicketCategory;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;
}
