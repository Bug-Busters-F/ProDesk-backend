import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class EscalateTicketRequest {
  @ApiProperty({ example: randomUUID(), description: 'ID do grupo' })
  @IsUUID()
  @IsNotEmpty()
  groupId!: string;

  @ApiProperty({
    example: 'web_app',
    description: 'Categoria do ticket',
  })
  @IsString()
  @IsNotEmpty()
  category!: string;
}
