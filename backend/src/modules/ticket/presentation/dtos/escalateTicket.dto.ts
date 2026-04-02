import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCategory } from '../../domain/entities/ticket.entity';
import { randomUUID } from 'crypto';

export class EscalateTicketRequest {
  @ApiProperty({ example: randomUUID(), description: 'ID do grupo' })
  @IsUUID()
  @IsNotEmpty()
  groupId!: string;

  @ApiProperty({ enum: TicketCategory, description: 'Categoria do ticket' })
  @IsString()
  @IsNotEmpty()
  category!: TicketCategory;
}
