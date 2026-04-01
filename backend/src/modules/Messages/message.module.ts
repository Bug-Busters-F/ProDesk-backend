import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./infra/message.schema";
import { MessageRepositoryMongodb } from "./infra/message.repository.mongodb";
import { MessageGateway } from "./presentation/message.gateway";
import { MessageService } from "./application/message.service";
import { MessageController } from "./presentation/message.controller";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ],
    controllers: [
        MessageController 
    ],
    providers: [
        MessageRepositoryMongodb,
        MessageGateway,
        MessageService
    ],
    exports: [
        MessageRepositoryMongodb
    ]
})
export class MessageModule {}