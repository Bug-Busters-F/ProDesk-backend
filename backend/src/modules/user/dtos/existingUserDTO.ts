import { ApiProperty } from "@nestjs/swagger";

export class ExistingUserDTO {
  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @ApiProperty({ example: 'Senha@123' })
  password: string;
}