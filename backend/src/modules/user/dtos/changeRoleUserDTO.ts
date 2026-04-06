import { IsEnum } from 'class-validator';
import { UserRole } from '../user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeRoleUserDTO {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;
}
