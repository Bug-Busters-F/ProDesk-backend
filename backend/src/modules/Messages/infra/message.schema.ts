import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({ required: true, type: String })
  chatId: string;// Referência ao chamado

  @Prop({ required: true, type: String })
  senderId: string; // Id do cliente ou atendente que enviou a mensagem

  @Prop({ required: true })
  content: string; // Conteúdo do chat

  @Prop({ default: false })
  isSystemMessage: boolean; // Flag para mensagens da URA digital

  @Prop({ required: false })
  readAt?: Date; // Controle pra saber se a mensagem foi lida
}

export const MessageSchema = SchemaFactory.createForClass(Message);
