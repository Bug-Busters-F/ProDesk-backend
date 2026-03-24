import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './infra/messages.schema';
import { MessageRepositoryMongodb } from './infra/messages.repository.mongodb';

@Module({
  imports: [
    // Avisa ao Mongoose para registrar o schema criado
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [
    MessageRepositoryMongodb, // Registra o repositório
  ],
  exports: [
    MessageRepositoryMongodb, // Exporta para que o AppController consiga usar para teste
  ],
})
export class MessagesModule {}
