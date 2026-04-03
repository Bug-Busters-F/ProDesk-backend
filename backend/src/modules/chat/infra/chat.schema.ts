import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true, collection: 'chats' })
export class Chat {
  @Prop({ required: true, type: Types.ObjectId })
  ticketId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  clientId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  agentId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  groupId: Types.ObjectId;

  @Prop({ default: 'open', enum: ['open', 'closed'] })
  status: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
