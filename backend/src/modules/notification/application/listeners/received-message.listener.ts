import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

import { NotificationStreamService }
    from "../services/notificatio.stream.service";

import { NotificationType }
    from "../../shared/enums/notification.enum";

import { ReceivedMessageNotificationEvent }
    from "../../../../shared/events/received-message-notification.event";

import { CreateMessageNotificationUseCase }
    from "../use-cases/create-message-notification.use-case";

@Injectable()
export class ReceivedMessageListener {

    constructor(

        private readonly createMessageNotificationUseCase:
            CreateMessageNotificationUseCase,

        private readonly notificationStreamService:
            NotificationStreamService,
    ) {}

    @OnEvent(NotificationType.NEW_MESSAGE)
    async handle(
        event: ReceivedMessageNotificationEvent,
    ) {

        console.log(
            '[ReceivedMessageListener] Evento recebido:',
            event,
        );

        const notification =
            await this.createMessageNotificationUseCase.execute({

                receiverId:
                    event.receiverId,

                senderId:
                    event.senderId,

                senderName:
                    event.senderName,

                chatId:
                    event.chatId,

                messageId:
                    event.messageId,

                contentPreview:
                    event.contentPreview,

                createdAt:
                    event.createdAt,
            });

        console.log(
            '[ReceivedMessageListener] Notificação criada:',
            notification,
        );

        this.notificationStreamService.send(
            event.receiverId,
            {
                notificationId:
                    notification.id,

                chatId:
                    event.chatId,

                messageId:
                    event.messageId,

                senderId:
                    event.senderId,

                senderName:
                    event.senderName,

                contentPreview:
                    event.contentPreview,

                type:
                    notification.type,

                createdAt:
                    event.createdAt,
            },
        );

        console.log(
            `[ReceivedMessageListener] Enviado via SSE para userId=${event.receiverId}`,
        );
    }
}