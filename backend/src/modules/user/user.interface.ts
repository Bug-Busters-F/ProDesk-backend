import { CompanyDetails } from "../company/company.interface";
import { GroupDetails } from "../group/group.interface";
import { UserRole } from "./user.schema";

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role:  UserRole;
  company?: CompanyDetails;
  group?: GroupDetails;
}