import { Notification } from "../entities/notification.entity";

export abstract class INotificationRepository {
    abstract create(notification: Notification): Promise<Notification>;

    abstract findByUserId(filters?: {userId?: string;read?: boolean;}): Promise<Notification[]>;

    abstract update(notification: Notification): Promise<Notification | null>;
}