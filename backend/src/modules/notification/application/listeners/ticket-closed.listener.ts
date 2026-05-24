import { Injectable } from "@nestjs/common";
import { CreateNotificationUseCase } from "../use-cases/create-notification.use-case";
import { NotificationType } from "../../shared/enums/notification.enum";
import { TicketClosedEvent } from "../../../../shared/events/ticket-closed.event";
import { OnEvent } from "@nestjs/event-emitter";
import { NotificationStreamService } from "../services/notificatio.stream.service";
import { Notification } from "../../domain/entities/notification.entity";
''

@Injectable()
export class TicketClosedListener {

    constructor(
        private readonly createNotificationUseCase:
            CreateNotificationUseCase,

        private readonly notificationStreamService:
            NotificationStreamService,
    ) {}

    @OnEvent(NotificationType.TICKET_CLOSED)
    async handle(event: TicketClosedEvent) {

        console.log('TicketClosedListener: Ticket closed event received', event);

        const notification: Notification = await this.createNotificationUseCase.execute({
            title: event.title,
            message: 'Seu chamado foi fechado',
            clientId: event.clientId,
            supportAgentId: "",
            type: NotificationType.TICKET_CLOSED,
        });

        this.notificationStreamService.send(
            event.clientId,
            notification,
        );

    }
}