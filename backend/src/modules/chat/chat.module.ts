import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Chat, ChatSchema } from './infra/chat.schema';
import { ChatRepositoryMongodb } from './infra/chat.repository.mongodb';
import { ChatService } from './application/chat.service';
import { ChatGateway } from './presentation/chat.gateway';
import { Message, MessageSchema } from '../Messages/infra/message.schema';
import { MessageRepositoryMongodb } from '../Messages/infra/message.repository.mongodb';
import { ChatController } from './presentation/chat.controller';
import { TicketSchemaClass, TicketSchema } from '../ticket/infra/schemas/ticket.mongo.schema';
import { User, UserSchema } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: TicketSchemaClass.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({ secret: 'secret' }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ChatRepositoryMongodb,
    MessageRepositoryMongodb,
    { provide: 'IChatRepository', useExisting: ChatRepositoryMongodb },
    { provide: 'IMessageRepository', useExisting: MessageRepositoryMongodb },
  ],
  exports: [ChatService, 'IChatRepository'],
})
export class ChatModule {}