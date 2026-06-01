import {
    Controller,
    Get,
    Patch,
    Param,
    Req,
    UseGuards,
} from "@nestjs/common";

import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";

import type { Request }
    from "express";

import { JwtGuard }
    from "../../../auth/guards/jwt.guard";

import { ListNotificationsUseCase }
    from "../../application/use-cases/list-notifications.use-case";

import { ReadNotificationUseCase }
    from "../../application/use-cases/read-notification.use-case";

interface RequestWithUser
    extends Request {

    user: {
        id: string;
    };
}

@ApiTags('Notifications')

@ApiBearerAuth()

@UseGuards(JwtGuard)

@Controller('notifications')
export class NotificationController {

    constructor(

        private readonly listNotificationsUseCase:
            ListNotificationsUseCase,

        private readonly readNotificationUseCase:
            ReadNotificationUseCase,
    ) {}

    @Get()

    @ApiOperation({
        summary:
            'Listar notificações do usuário autenticado',
    })

    @ApiResponse({
        status: 200,
        description:
            'Notificações retornadas com sucesso',
    })
    async findAll(
        @Req() request: RequestWithUser,
    ) {

        return this.listNotificationsUseCase.execute(
            request.user.id,
        );
    }

    @Patch(':id/read')

    @ApiOperation({
        summary:
            'Marcar notificação como lida',
    })

    @ApiResponse({
        status: 200,
        description:
            'Notificação atualizada',
    })
    async read(
        @Param('id') id: string,
    ) {

         this.readNotificationUseCase.execute(
            id,
        );

        return { message: 'Notificação marcada como lida' };
    }
}