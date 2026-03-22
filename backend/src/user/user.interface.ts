import { CompanyDTO } from "../company/company.interface";
import { GroupDTO } from "../group/group.interface";
import { UserRole } from "./user.schema";

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role:  UserRole;
  company?: CompanyDTO;
  group?: GroupDTO;
}