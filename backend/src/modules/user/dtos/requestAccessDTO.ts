import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class RequestAccessDTO {
  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678000100' })
  @IsNotEmpty()
  @Length(14, 14)
  @Matches(/^\d+$/, { message: 'CNPJ deve conter apenas números' })
  cnpj: string;
}