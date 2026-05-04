import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { CompanyService } from './company.service';
import { CreateCompanyDTO } from './dtos/createCompanyDTO';
import { UpdateCompanyDTO } from './dtos/updateCompanyDTO';
import { CompanyDetails } from './company.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../shared/enums/user.enum';

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar empresa' })
  @ApiBody({ type: CreateCompanyDTO })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  createCompany(@Body() data: CreateCompanyDTO): Promise<CompanyDetails> {
    return this.companyService.createCompany(data.name, data.cnpj);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Listar todas as empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas retornada' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (permissão insuficiente)',
  })
  getAllCompanies(): Promise<CompanyDetails[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (permissão insuficiente)',
  })
  getCompany(@Param('id') id: string): Promise<CompanyDetails> {
    return this.companyService.findById(id);
  }

  @Get('cnpj/:cnpj')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Buscar empresa pelo CNPJ' })
  @ApiParam({ name: 'cnpj', example: '612345678000199' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (permissão insuficiente)',
  })
  getCompanyByCNPJ(@Param('cnpj') cnpj: string): Promise<CompanyDetails> {
    return this.companyService.findByCnpj(cnpj);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar empresa' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiBody({ type: UpdateCompanyDTO })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  updateCompany(
    @Param('id') id: string,
    @Body() data: UpdateCompanyDTO,
  ): Promise<CompanyDetails> {
    return this.companyService.updateCompany(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar empresa' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Empresa deletada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  deleteCompany(@Param('id') id: string): Promise<void> {
    return this.companyService.deleteCompany(id);
  }
}
