import { Injectable } from "@nestjs/common";

import { INotificationRepository }
    from "../../domain/repository/notification.repository.interface";

@Injectable()
export class ListNotificationsUseCase {

    constructor(
        private readonly notificationRepository:
            INotificationRepository,
    ) {}

    async execute(
        userId: string,
    ) {

        const notifications =
            await this.notificationRepository.findByUserId({
                userId,
            });

        return notifications.map(
            (notification) => notification.toPrimitives(),
        );
    }
}