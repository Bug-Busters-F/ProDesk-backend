import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  Post,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UserDetails } from './user.interface';
import { UpdateUserDTO } from './dtos/updateUserDTO';
import { FilterUserDTO } from './dtos/filterUserDTO';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './user.schema';
import { ChangeRoleUserDTO } from './dtos/changeRoleUserDTO';
import { ChangeCategoriesUserDTO } from './dtos/changeCategoriesUserDTO';
import { RequestAccessDTO } from './dtos/requestAccessDTO';
import { FilterAccessRequestDTO } from './dtos/filterAccessRequestDTO';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Post('/requestAccess')
  @ApiOperation({ summary: 'Solicitar acesso ao sistema' })
  @ApiBody({ type: RequestAccessDTO })
  @ApiResponse({ status: 201, description: 'Solicitação enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na solicitação' })
  requestAccess(
    @Body() body: RequestAccessDTO,
  ) {
    return this.userService.requestAccess(body.name, body.email, body.cnpj);
  }

  @Get('/requests')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar solicitações de acesso' })
  getRequests(@Query() query: FilterAccessRequestDTO) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return this.userService.findAllRequests(page, limit, query);
  }

  @Get('/requests/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 200, description: 'Request encontrado' })
  @ApiResponse({ status: 404, description: 'Request não encontrado' })
  getRequestById(@Param('id') id: string) {
    return this.userService.findRequestById(id);
  }

  @Patch('/approve/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string) {
    return this.userService.approveRequest(id);
  }

  @Patch('/reject/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reject(@Param('id') id: string) {
    return this.userService.rejectRequest(id);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (permissão insuficiente)',
  })
  getAllUsers(@Query() query: FilterUserDTO) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return this.userService.findAll(page, limit, query);
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (permissão insuficiente)',
  })
  getUser(@Param('id') id: string): Promise<UserDetails> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiBody({ type: UpdateUserDTO })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN ou SUPPORT)',
  })
  updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDTO,
  ): Promise<UserDetails> {
    return this.userService.updateUser(id, data);
  }

  @Patch('changeRole/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Alterar role do usuário' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiBody({ type: ChangeRoleUserDTO })
  @ApiResponse({ status: 200, description: 'Role atualizada' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  changeRoleUser(
    @Param('id') id: string,
    @Body() data: ChangeRoleUserDTO,
  ): Promise<UserDetails> {
    return this.userService.updateUser(id, data);
  }

  @Patch('changeCategories/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Alterar categorias do usuário' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiBody({ type: ChangeCategoriesUserDTO })
  @ApiResponse({ status: 200, description: 'Categorias atualizadas' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  changeCategoriesUser(
    @Param('id') id: string,
    @Body() data: ChangeCategoriesUserDTO,
  ): Promise<UserDetails> {
    return this.userService.updateUser(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Usuário deletado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}