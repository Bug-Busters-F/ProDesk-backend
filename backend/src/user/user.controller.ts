import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDetails } from './user.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @UseGuards(JwtGuard)
    @Get(":id")
    getUser(@Param("id") id: string): Promise<UserDetails | null>{
        return this.userService.findById(id);
    }
}
