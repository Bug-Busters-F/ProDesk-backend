import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Chat, ChatSchema } from './infra/chat.schema';
import { ChatRepositoryMongodb } from './infra/chat.repository.mongodb';
import { ChatService } from './application/chat.service';
import { ChatGateway } from './presentation/chat.gateway';
import { Message, MessageSchema } from '../Messages/infra/message.schema';
import { MessageRepositoryMongodb } from '../Messages/infra/message.repository.mongodb';

@Module({
  imports: [
    // Registra schemas de Chat e Message pro Mongoose
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),

    // JwtModule registrado localmente valida tokens no gateway
    // Usa a mesma secret do AuthModule — apenas verificação, não geração
    JwtModule.register({ secret: 'secret' }),
  ],
  providers: [
    ChatService,
    ChatGateway,
    ChatRepositoryMongodb,
    MessageRepositoryMongodb,

    // Bindings interfaces injeção de dependência
    { provide: 'IChatRepository', useExisting: ChatRepositoryMongodb },
    { provide: 'IMessageRepository', useExisting: MessageRepositoryMongodb },
  ],
  exports: [ChatService],
})
export class ChatModule {}
