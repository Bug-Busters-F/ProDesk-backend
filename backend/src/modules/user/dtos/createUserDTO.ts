import { IsEmail, IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { UserRole } from '../user.schema';

export class CreateUserDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/, {
  message: 'The password must be at least 8 characters long, including uppercase, lowercase, numbers, and symbols.'})
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateAdminDTO{
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/, {
  message: 'The password must be at least 8 characters long, including uppercase, lowercase, numbers, and symbols.'})
  password: string;

  role = UserRole.ADMIN

  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateSupportDTO{
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/, {
  message: 'The password must be at least 8 characters long, including uppercase, lowercase, numbers, and symbols.'})
  password: string;

  role = UserRole.SUPPORT

  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateClientDTO{
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/, {
  message: 'The password must be at least 8 characters long, including uppercase, lowercase, numbers, and symbols.'})
  password: string;

  role = UserRole.CLIENT

  @IsString()
  companyId: string;
}