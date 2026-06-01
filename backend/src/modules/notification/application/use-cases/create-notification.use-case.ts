import { Injectable } from "@nestjs/common";
import { CreateNotificationDTO } from "../dto/create-notification.dto";
import { Notification } from "../../domain/entities/notification.entity";
import { INotificationRepository } from "../../domain/repository/notification.repository.interface";

@Injectable()
export class CreateNotificationUseCase {

    constructor(
        private readonly notificationRepository:
            INotificationRepository,
    ) {}

    async execute(data: CreateNotificationDTO): Promise<Notification> {

    const notification = Notification.create({
        title: data.title,
        message: data.message,
        clientId: data.clientId,
        supportAgentId: data.supportAgentId,
        type: data.type,

        ticketId: data.ticketId,
    });

        await this.notificationRepository.create(
            notification,
        );

        return notification
    }
}