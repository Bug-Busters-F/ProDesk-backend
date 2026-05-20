import { Injectable } from "@nestjs/common";
import { CreateNotificationUseCase } from "../use-cases/create-notification.use-case";
import { NotificationType } from "../../shared/enums/notification.enum";
import { OnEvent } from "@nestjs/event-emitter";
import { NotificationStreamService } from "../services/notificatio.stream.service";
import { TicketOpenEvent } from "../../../../shared/events/ticket-open.event";
import { UserService } from "../../../user/user.service";
''

@Injectable()
export class TicketOpenListener {

    constructor(
        private readonly createNotificationUseCase:
            CreateNotificationUseCase,

        private readonly notificationStreamService:
            NotificationStreamService,
        
        private readonly userService:
        UserService,
    ) {}

    @OnEvent(NotificationType.TICKET_OPEN)
    async handle(event: TicketOpenEvent) {

        console.log('[TicketOpenListener] Evento recebido:', event);

        const users = await this.userService.findAll(
            1,
            100,
            {
                categoryId: event.category,
            },
        );

        console.log(
            `[TicketOpenListener] Usuários encontrados: ${users.data.length}`,
        );

        console.log(
            '[TicketOpenListener] IDs dos usuários:',
            users.data.map(u => u.id),
        );

        if (!users.data.length) {
            console.log(
                '[TicketOpenListener] Nenhum usuário encontrado para essa categoria',
            );
            return;
        }

        for (const user of users.data) {

            console.log(
                `[TicketOpenListener] Criando notificação para userId=${user.id}`,
            );

            const notification = await this.createNotificationUseCase.execute({
                title: event.title,
                message: 'Um novo chamado foi aberto na sua categoria',
                clientId: '',
                supportAgentId: user.id,
                type: NotificationType.TICKET_OPEN,
            });

            console.log(
                `[TicketOpenListener] Notificação criada para userId=${user.id}`,
                notification,
            );

            this.notificationStreamService.send(
                user.id,
                notification,
            );

            console.log(
                `[TicketOpenListener] Enviado via SSE para userId=${user.id}`,
            );
        }
    }
    
}