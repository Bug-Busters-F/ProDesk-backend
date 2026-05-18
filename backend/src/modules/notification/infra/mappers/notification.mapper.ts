import { Notification }
    from "../../domain/entities/notification.entity";

import { NotificationDocument, NotificationLean }
    from "../schemas/notification.mongo.schema";

export class NotificationMapper {

    static toDomain(
        doc: NotificationDocument | NotificationLean,
    ): Notification {

        return Notification.restore({
            id: doc._id.toString(),
            clientId: doc.clientId.toString(),
            supportAgentId:
                doc.supportAgentId.toString(),

            title: doc.title,
            message: doc.message,

            read: doc.read,

            type: doc.type,

            createdAt: doc.createdAt,
        });
    }

    static toPersistence(
        notification: Notification,
    ): Record<string, any> {

        return {
            id: notification.id,

            clientId: notification.clientId,

            supportAgentId:
                notification.supportAgentId,

            title: notification.title,

            message: notification.message,

            read: notification.read,

            type: notification.type,

            createdAt: notification.createdAt,
        };
    }
}