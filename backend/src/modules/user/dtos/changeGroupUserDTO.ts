import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangeGroupUserDTO {
  @ApiProperty({ example: '65f1a2b3c9d123456789abcd' })
  @IsString()
  groupId: string;
}
