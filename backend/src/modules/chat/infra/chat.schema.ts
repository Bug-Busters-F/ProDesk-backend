import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true, collection: 'chats' })
export class Chat {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  ticketId: string;

  @Prop({ required: true, type: Types.ObjectId })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  agentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null }) 
  groupId: Types.ObjectId;

  @Prop({ default: 'open', enum: ['open', 'closed'] })
  status: string;
  
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
