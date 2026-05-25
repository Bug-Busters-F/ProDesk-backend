import {
    Controller,
    MessageEvent,
    Req,
    Sse,
    UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { Observable } from 'rxjs';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { NotificationStreamService }
    from '../../application/services/notificatio.stream.service';
import { JwtGuard } from '../../../auth/guards/jwt.guard';





/**
 * Interface do Request contendo
 * o usuário autenticado pelo JWT.
 */
interface RequestWithUser extends Request {
    user: {
        id: string;
    };
}

@ApiTags('Notifications')

@Controller('notifications')
export class NotificationSSEController {

    constructor(
        private readonly notificationStreamService:
            NotificationStreamService,
    ) {}

    /**
     * Stream SSE de notificações
     * em tempo real.
     */
    @Sse('stream')

    @UseGuards(JwtGuard)

    @ApiBearerAuth()

    @ApiOperation({
        summary:
            'Stream SSE de notificações em tempo real',
    })

    @ApiResponse({
        status: 200,
        description:
            'Conexão SSE iniciada com sucesso',
    })

    @ApiResponse({
        status: 401,
        description:
            'Não autenticado',
    })

    stream(
        @Req() request: RequestWithUser,
    ): Observable<MessageEvent> {

        /**
         * Obtém o ID do usuário
         * autenticado pelo JWT.
         */
        const userId = request.user.id;

        /**
         * Quando o usuário fechar
         * a conexão SSE:
         *
         * remove o stream da memória
         * para evitar memory leak.
         */
        request.on('close', () => {

            this.notificationStreamService
                .removeStream(userId);
        });

        /**
         * Retorna o stream SSE
         * do usuário.
         */
        return this.notificationStreamService
            .getStream(userId)
            .asObservable();
    }
}