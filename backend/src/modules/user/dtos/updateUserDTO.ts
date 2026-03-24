import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../user.schema';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  companyId?: string;
}

