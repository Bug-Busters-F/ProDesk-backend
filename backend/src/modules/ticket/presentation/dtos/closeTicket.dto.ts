import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CloseTicketRequest {
  @ApiProperty({
    example: 'O problema foi resolvido reiniciando o servidor.',
  })
  @IsString()
  @IsNotEmpty()
  solution: string;
}