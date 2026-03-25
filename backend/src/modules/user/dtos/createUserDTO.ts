import { IsEmail, IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { UserRole } from '../user.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({ example: 'Gabriel' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'gabriel@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo'
  })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '65f1a2b3c9d123456789abcd' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ example: '65f1a2b3c9d123456789efgh' })
  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateAdminDTO {
  @ApiProperty({ example: 'Admin User' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/)
  password: string;

  @ApiPropertyOptional({ example: '65f1a2b3c9d123456789abcd' })
  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateSupportDTO{
  @ApiProperty({ example: 'Support User' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'support@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Support@123' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/)
  password: string;

  @ApiPropertyOptional({ example: '65f1a2b3c9d123456789abcd' })
  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateClientDTO{
  @ApiProperty({ example: 'Client User' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'client@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Client@123' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/)
  password: string;

  role = UserRole.CLIENT

  @ApiProperty({ example: '65f1a2b3c9d123456789abcd' })
  @IsString()
  companyId: string;
}