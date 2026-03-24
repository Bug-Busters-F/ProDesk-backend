import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { UserRole } from '../user.schema';

export class FilterUserDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}