import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CreateUserDTO } from '../user/dtos/createUserDTO';
import { UserDetails } from '../user/user.interface';
import type { ExistingUserDTO } from '../user/dtos/existingUserDTO';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post("register")
    register(@Body() user: CreateUserDTO): Promise<UserDetails | null> {
        return this.authService.register(user);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() user: ExistingUserDTO): Promise<{token:string} | null> {
        return this.authService.login(user);
    }
}
