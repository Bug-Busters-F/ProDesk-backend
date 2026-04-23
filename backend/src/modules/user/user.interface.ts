import { CategoryDetails } from '../category/category.interface';
import { CompanyDetails } from '../company/company.interface';
import { UserRole } from '../shared/enums/user.enum';

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: CompanyDetails;
  categories?: CategoryDetails[];
}
