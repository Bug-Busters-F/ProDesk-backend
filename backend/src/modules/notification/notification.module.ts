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
import { CreateMessageNotificationUseCase } from "./application/use-cases/create-message-notification.use-case";


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
    NotificationMongoRepository,
    CreateMessageNotificationUseCase,
    TicketClosedListener,
    TicketOpenListener,
    ReceivedMessageListener,

        {
            provide: INotificationRepository,
            useClass: NotificationMongoRepository,
        },
    ],

    controllers: [
        NotificationSSEController,
    ],

    exports: [
        CreateNotificationUseCase,
        NotificationStreamService,
    ],
})
export class NotificationModule {}