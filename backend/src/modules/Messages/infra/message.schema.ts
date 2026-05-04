import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({ required: true, type: String })
  chatId: string;

  @Prop({ required: true, type: String })
  senderId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isSystemMessage: boolean;

  @Prop({ required: false })
  readAt?: Date;

  @Prop({ type: [String], default: [] })
  fileIds?: string[];

  @Prop({ required: false, type: String })
  attachmentUrl?: string;

  @Prop({ required: false, type: String, default: 'TEXT' })
  type?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
