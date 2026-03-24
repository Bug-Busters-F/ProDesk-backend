import {Body, Controller, Get, Param, Post, Patch, Delete, UseGuards} from '@nestjs/common';

import { CompanyService } from './company.service';
import { CreateCompanyDTO } from './dtos/createCompanyDTO';
import { UpdateCompanyDTO } from './dtos/updateCompanyDTO';
import { CompanyDetails } from './company.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../user/user.schema';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createCompany(@Body() data: CreateCompanyDTO): Promise<CompanyDetails> {
    return this.companyService.createCompany(
      data.name,
      data.cnpj
    );
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.SUPPORT,UserRole.CLIENT)
  getAllCompanies(): Promise<CompanyDetails[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.SUPPORT,UserRole.CLIENT)
  getCompany(@Param('id') id: string): Promise<CompanyDetails> {
    return this.companyService.findById(id);
  }
  
  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCompany(@Param('id') id: string, @Body() data: UpdateCompanyDTO): Promise<CompanyDetails> {
    return this.companyService.updateCompany(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteCompany(@Param('id') id: string): Promise<void> {
    return this.companyService.deleteCompany(id);
  }
}