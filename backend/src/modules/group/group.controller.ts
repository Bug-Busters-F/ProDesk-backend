import {Body,Controller,Get,Param,Post,Patch,Delete, UseGuards, Req} from '@nestjs/common';

import { GroupService } from './group.service';
import { CreateGroupDTO } from './dtos/createGroupDTO';
import { UpdateGroupDTO } from './dtos/updateGroupDTO';
import { GroupDetails } from './group.interface';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/user.schema';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createGroup(@Body() group: CreateGroupDTO): Promise<GroupDetails> {
    return this.groupService.createGroup(
      group.name,
      group.description
    );
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.SUPPORT)
  getAllGroups(): Promise<GroupDetails[]> {
    return this.groupService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.SUPPORT)
  getGroup(@Param('id') id: string): Promise<GroupDetails> {
    return this.groupService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateGroup(@Param('id') id: string, @Body() data: UpdateGroupDTO): Promise<GroupDetails> {
    return this.groupService.updateGroup(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteGroup(@Param('id') id: string): Promise<void> {
    return this.groupService.deleteGroup(id);
  }
}