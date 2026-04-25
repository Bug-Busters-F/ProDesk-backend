import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketRequest {
  @ApiProperty({ example: 'Título do ticket', description: 'Título do ticket' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Descrição do ticket',
    description: 'Descrição do ticket',
  })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'uuid-do-cliente', description: 'ID do cliente' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  clientId!: string;

  @ApiProperty({ example: 1, description: 'Nível do chamado (1 a 3)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  level?: number;
}
