import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateCompanyDTO {
  @ApiPropertyOptional({ example: 'Tech Solutions Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '12345678000199', minLength: 14, maxLength: 14 })
  @IsOptional()
  @IsString()
  @Length(14, 14)
  cnpj?: string;
}