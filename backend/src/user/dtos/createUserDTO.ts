import { UserRole } from "../user.schema";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role:  UserRole;
  companyId?: string;
  groupId?: string;
}