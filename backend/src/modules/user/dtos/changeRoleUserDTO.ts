import { IsEnum } from "class-validator";
import { UserRole } from "../user.schema";

export class ChangeRoleUserDTO {
  @IsEnum(UserRole)
  role: UserRole;
}