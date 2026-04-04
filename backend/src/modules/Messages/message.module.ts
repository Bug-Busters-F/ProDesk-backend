import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './infra/message.schema';
import { MessageRepositoryMongodb } from './infra/message.repository.mongodb';
import { MessageGateway } from './presentation/message.gateway';

@Module({
  imports: [
    // Avisa ao Mongoose para registrar o schema criado
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [
    MessageRepositoryMongodb, // Registra o repositório
    MessageGateway,
  ],
  exports: [
    MessageRepositoryMongodb, // Exporta para que o AppController consiga usar para teste
  ],
})
export class MessageModule {}
