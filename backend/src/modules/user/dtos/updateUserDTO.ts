import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDTO {
  @ApiPropertyOptional({ example: 'Novo Nome' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'novo@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'companyId' })
  @IsOptional()
  @IsString()
  companyId?: string;
}