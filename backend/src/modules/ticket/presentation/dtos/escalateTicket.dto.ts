import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class EscalateTicketRequest {
  @ApiProperty({ example: randomUUID(), description: 'ID do grupo' })
  @IsString()
  @IsNotEmpty()
  groupId!: string;

  @ApiProperty({ example: 'web_app', description: 'Categoria do ticket' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ 
    example: 'Reiniciei o servidor e o problema persistiu.',
    description: 'O que foi feito antes de escalonar' })
  @IsString()
  @IsNotEmpty()
  whatWasDone!: string;
}
