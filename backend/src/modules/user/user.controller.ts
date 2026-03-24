import {Controller, Get, Param, Post, Patch, Delete, Body, Query, UseGuards} from '@nestjs/common';

import { UserService } from './user.service';
import { UserDetails } from './user.interface';
import { UpdateUserDTO } from './dtos/updateUserDTO';
import { FilterUserDTO } from './dtos/filterUserDTO';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './user.schema';
import { ChangeRoleUserDTO } from './dtos/changeRoleUserDTO';
import { ChangeGroupUserDTO } from './dtos/changeGroupUserDTO';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.SUPPORT,UserRole.CLIENT)
  getAllUsers(@Query() query: FilterUserDTO) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return this.userService.findAll(page, limit, query);
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.SUPPORT,UserRole.CLIENT)
  getUser(@Param('id') id: string): Promise<UserDetails> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.SUPPORT)
  updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDTO
  ): Promise<UserDetails> {
    return this.userService.updateUser(id, data);
  }

  @Patch('changeRole/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  changeRoleUser(
    @Param('id') id: string,
    @Body() data: ChangeRoleUserDTO
  ): Promise<UserDetails> {
    return this.userService.updateUser(id, data);
  }

  @Patch('changeGroup/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  changeGroupUser(
    @Param('id') id: string,
    @Body() data: ChangeGroupUserDTO
  ): Promise<UserDetails> {
    return this.userService.updateUser(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}