import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateGroupDTO {
  @ApiProperty({ example: 'Support Team' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Grupo responsável pelo suporte' })
  @IsOptional()
  @IsString()
  description?: string;
}
