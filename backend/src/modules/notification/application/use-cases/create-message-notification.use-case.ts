import { Injectable } from "@nestjs/common";

import { INotificationRepository }
    from "../../domain/repository/notification.repository.interface";

import { NotificationType }
    from "../../shared/enums/notification.enum";

import { CreateMessageNotificationDTO }
    from "../dto/create-notification.dto";

import { Notification }
    from "../../domain/entities/notification.entity";

@Injectable()
export class CreateMessageNotificationUseCase {

    constructor(
        private readonly notificationRepository:
            INotificationRepository,
    ) {}

    async execute(
        data: CreateMessageNotificationDTO,
    ): Promise<Notification> {

        const isSupport =
            data.senderName
                .toLowerCase()
                .includes('support');

    const notification = Notification.create({
        title: `Nova mensagem de ${data.senderName}`,
        message: data.contentPreview,

        clientId: isSupport ? data.receiverId : '',
        supportAgentId: isSupport ? '' : data.receiverId,

        type: NotificationType.NEW_MESSAGE,

        chatId: data.chatId,
    });

        await this.notificationRepository.create(
            notification,
        );

        return notification;
    }
}