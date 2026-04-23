import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAdminDTO,
  CreateClientDTO,
  CreateSupportDTO,
} from '../user/dtos/createUserDTO';
import { UserDetails } from '../user/user.interface';
import { ExistingUserDTO } from '../user/dtos/existingUserDTO';
import { UserRole } from '../shared/enums/user.enum';
import { Roles } from './guards/roles.decorator';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    this.authService.createFirstAdmin();
  }

  @Post('register/client')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar usuário CLIENT' })
  @ApiBody({ type: CreateClientDTO })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN ou SUPPORT)',
  })
  registerClient(@Body() user: CreateClientDTO): Promise<UserDetails | null> {
    return this.authService.register({
      ...user,
      role: UserRole.CLIENT,
    });
  }

  @Post('register/support')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar usuário SUPPORT' })
  @ApiBody({ type: CreateSupportDTO })
  @ApiResponse({ status: 201, description: 'Support criado com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  registerSupport(@Body() user: CreateSupportDTO): Promise<UserDetails | null> {
    return this.authService.register({
      ...user,
      role: UserRole.SUPPORT,
    });
  }

  @Post('register/admin')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar usuário ADMIN' })
  @ApiBody({ type: CreateAdminDTO })
  @ApiResponse({ status: 201, description: 'Admin criado com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado (token inválido ou ausente)',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (somente ADMIN)',
  })
  register(@Body() user: CreateAdminDTO): Promise<UserDetails> {
    return this.authService.register({
      ...user,
      role: UserRole.ADMIN,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: ExistingUserDTO })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        token: 'jwt.token.aqui',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  login(@Body() user: ExistingUserDTO): Promise<{ token: string } | null> {
    return this.authService.login(user);
  }
}
