import { IsString } from "class-validator";

export class ChangeGroupUserDTO {
  @IsString()
  groupId: string;
}