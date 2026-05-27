import { Module } from "@nestjs/common";

import { MongooseModule }
    from "@nestjs/mongoose";

import {
    NotificationSchema,
    NotificationSchemaClass,
} from "./infra/schemas/notification.mongo.schema";

import { CreateNotificationUseCase }
    from "./application/use-cases/create-notification.use-case";

import { NotificationMongoRepository }
    from "./infra/repositories/notification.mongodb.repository";

import { INotificationRepository }
    from "./domain/repository/notification.repository.interface";

import { NotificationSSEController }
    from "./presetation/controllers/notification.sse.controller";

import { NotificationStreamService }
    from "./application/services/notificatio.stream.service";

import { TicketClosedListener } from "./application/listeners/ticket-closed.listener";
import { UserModule } from "../user/user.module";
import { TicketOpenListener } from "./application/listeners/ticket-open.listener";
import { ReceivedMessageListener } from "./application/listeners/received-message.listener";
import { AccessRequestListener } from "./application/listeners/access-request.listener";
import { CreateMessageNotificationUseCase } from "./application/use-cases/create-message-notification.use-case";
import { NotificationController } from "./presetation/controllers/notification.controller";
import { ListNotificationsUseCase } from "./application/use-cases/list-notifications.use-case";
import { ReadNotificationUseCase } from "./application/use-cases/read-notification.use-case";


@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: NotificationSchemaClass.name,
                schema: NotificationSchema,
            },
        ]),
        UserModule,
    ],

    providers: [
        NotificationStreamService,

        CreateNotificationUseCase,
        CreateMessageNotificationUseCase,

        ListNotificationsUseCase,
        ReadNotificationUseCase,

        NotificationMongoRepository,

        TicketClosedListener,
        TicketOpenListener,
        ReceivedMessageListener,
        AccessRequestListener,

        {
            provide: INotificationRepository,
            useClass: NotificationMongoRepository,
        },
    ],

    controllers: [
        NotificationSSEController,
        NotificationController,
    ],

    exports: [
        CreateNotificationUseCase,
        NotificationStreamService,
    ],
})
export class NotificationModule {}