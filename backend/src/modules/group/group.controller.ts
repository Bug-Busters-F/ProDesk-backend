import {Body,Controller,Get,Param,Post,Patch,Delete, UseGuards, Req} from '@nestjs/common';

import { GroupService } from './group.service';
import { CreateGroupDTO } from './dtos/createGroupDTO';
import { UpdateGroupDTO } from './dtos/updateGroupDTO';
import { GroupDetails } from './group.interface';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/user.schema';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Group')
@ApiBearerAuth()
@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar grupo' })
  @ApiBody({ type: CreateGroupDTO })
  @ApiResponse({ status: 201, description: 'Grupo criado com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)'
  })
  createGroup(@Body() group: CreateGroupDTO): Promise<GroupDetails> {
    return this.groupService.createGroup(
      group.name,
      group.description
    );
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Listar todos os grupos' })
  @ApiResponse({ status: 200, description: 'Lista de grupos retornada' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN ou SUPPORT)'
  })
  getAllGroups(): Promise<GroupDetails[]> {
    return this.groupService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Buscar grupo por ID' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Grupo encontrado' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN ou SUPPORT)'
  })
  getGroup(@Param('id') id: string): Promise<GroupDetails> {
    return this.groupService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar grupo' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiBody({ type: UpdateGroupDTO })
  @ApiResponse({ status: 200, description: 'Grupo atualizado' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)'
  })
  updateGroup(
    @Param('id') id: string,
    @Body() data: UpdateGroupDTO
  ): Promise<GroupDetails> {
    return this.groupService.updateGroup(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar grupo' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Grupo deletado' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)'
  })
  deleteGroup(@Param('id') id: string): Promise<void> {
    return this.groupService.deleteGroup(id);
  }
}