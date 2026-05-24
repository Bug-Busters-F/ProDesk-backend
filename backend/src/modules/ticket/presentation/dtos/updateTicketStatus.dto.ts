import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../../domain/entities/ticket.entity';

export class UpdateTicketStatusRequest {
  @ApiProperty({
    example: 'IN_PROGRESS',
    enum: TicketStatus,
  })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;

  @ApiProperty({
    example: 'O problema foi resolvido reiniciando o servidor.',
    required: false,
  })
  @IsString()
  @IsOptional()
  solution?: string;

  @ApiProperty({
    example: 'uuid-do-grupo',
    required: false,
  })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiProperty({
    example: 'web_app',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: 'Foi feita a verificação física...',
    required: false,
  })
  @IsString()
  @IsOptional()
  whatWasDone?: string;
}
