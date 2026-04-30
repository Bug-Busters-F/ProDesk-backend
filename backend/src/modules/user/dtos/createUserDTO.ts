import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsStrongPassword,
  IsArray,
  IsMongoId,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
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
    description:
      'Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo',
  })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '65f1a2b3c9d123456789abcd' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({
    example: ['65f1a2b3c9d123456789abcd'],
    description: 'Lista de IDs de categorias',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    example: 1,
    description: 'Nível do atendente (1 a 3)'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  level?: number;
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
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @ApiPropertyOptional({
    example: ['65f1a2b3c9d123456789abcd'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categories?: string[];
}

export class CreateSupportDTO {
  @ApiProperty({ example: 'Support User' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'support@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Support@123' })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @ApiPropertyOptional({
    example: ['65f1a2b3c9d123456789abcd'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    example: 1,
    description: 'Nível do atendente (1 a 3)'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  level?: number;
}

export class CreateClientDTO {
  @ApiProperty({ example: 'Client User' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'client@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Client@123' })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  role = UserRole.CLIENT;

  @ApiProperty({ example: '65f1a2b3c9d123456789abcd' })
  @IsString()
  companyId: string;
}