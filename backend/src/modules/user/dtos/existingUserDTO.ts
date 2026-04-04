import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ExistingUserDTO {
  @ApiProperty({ example: 'user@email.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  password: string;
}
