import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCategory } from '../../domain/entities/ticket.entity';

export class CreateTicketRequest {
  @ApiProperty({ example: 'Título do ticket', description: 'Título do ticket' })
  @IsString()
  title!: string;

  @ApiProperty({ enum: TicketCategory, description: 'Categoria do ticket' })
  @IsString()
  category!: TicketCategory;

  @ApiProperty({
    example: 'Descrição do ticket',
    description: 'Descrição do ticket',
  })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'uuid-do-cliente', description: 'ID do cliente' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
