import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';

export enum AccessRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class FilterAccessRequestDTO {
  @ApiPropertyOptional({ example: 'João' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'email@email.com' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '12345678000100' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional({ enum: AccessRequestStatus })
  @IsOptional()
  @IsEnum(AccessRequestStatus)
  status?: AccessRequestStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}