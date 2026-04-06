import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class TriageDTO {
  @ApiPropertyOptional({ example: 'não consigo acessar o sistema' })
  @IsString()
  description?: string;
}
