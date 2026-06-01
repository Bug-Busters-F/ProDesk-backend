import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { INotificationRepository }
    from "../../domain/repository/notification.repository.interface";

@Injectable()
export class ReadNotificationUseCase {

    constructor(
        private readonly notificationRepository:
            INotificationRepository,
    ) {}

    async execute(
        notificationId: string,
    ) {

        const notification =
            await this.notificationRepository.findById(
                notificationId,
            );

        if (!notification) {
            throw new NotFoundException(
                'Notification not found',
            );
        }

        notification.markAsRead();

        return this.notificationRepository.update(
            notification,
        );
    }
}