import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CreateAdminDTO, CreateClientDTO, CreateSupportDTO} from '../user/dtos/createUserDTO';
import { UserDetails } from '../user/user.interface';
import type { ExistingUserDTO } from '../user/dtos/existingUserDTO';
import { UserRole } from '../user/user.schema';
import { Roles } from './guards/roles.decorator';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){

        this.authService.createFirstAdmin()
    }

    @Post("register/client")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN,UserRole.SUPPORT)
    registerClient(@Body() user: CreateClientDTO): Promise<UserDetails | null> {
        return this.authService.register({
        ...user,
        role: UserRole.CLIENT
    });
    }

    @Post("register/support")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    registerSupport(@Body() user: CreateSupportDTO): Promise<UserDetails | null> {
        return this.authService.register({
        ...user,
        role: UserRole.SUPPORT
    });
    }

    @Post("register/admin")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    register(@Body() user: CreateAdminDTO): Promise<UserDetails> {
    return this.authService.register({
        ...user,
        role: UserRole.ADMIN
    });
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() user: ExistingUserDTO): Promise<{token:string} | null> {
        return this.authService.login(user);
    }
}
