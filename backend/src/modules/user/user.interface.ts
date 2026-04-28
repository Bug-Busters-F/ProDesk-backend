import { CategoryDetails } from '../category/category.interface';
import { CompanyDetails } from '../company/company.interface';
import { UserRole } from './user.schema';

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level?: number;
  company?: CompanyDetails;
  categories?: CategoryDetails[];
  profileImage?: string;
}
