import { Injectable } from "@nestjs/common";
import { CreateNotificationUseCase } from "../use-cases/create-notification.use-case";
import { NotificationType } from "../../shared/enums/notification.enum";
import { OnEvent } from "@nestjs/event-emitter";
import { NotificationStreamService } from "../services/notificatio.stream.service";
import { Notification } from "../../domain/entities/notification.entity";
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

    @OnEvent('ticket_open')
    async handle(event: TicketOpenEvent) {

        console.log('TicketOpenListener: Ticket open event received', event);
        
const users = await this.userService.findAll(
    1,
    100,
    {
        categoryId: event.category,
    },
);

/**
 * users.data contém os usuários.
 */
for (const user of users.data) {

    const notification: Notification =
        await this.createNotificationUseCase.execute({

            title: event.title,

            message:
                'Um novo chamado foi aberto na sua categoria',

            clientId: "",

            supportAgentId: user.id,

            type: NotificationType.TICKET_OPEN,
        });

        /**
         * Envia em tempo real via SSE
         */
        this.notificationStreamService.send(
            user.id,
            notification,
        );
    }

    }
}