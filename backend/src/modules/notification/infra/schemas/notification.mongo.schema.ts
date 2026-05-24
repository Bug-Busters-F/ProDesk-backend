import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NotificationType } from '../../shared/enums/notification.enum';


@Schema()
export class NotificationSchemaClass {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: false })
  clientId: string;

  @Prop({ required: false })
  supportAgentId: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({
    type: String,
    enum: NotificationType,
    required: true,
  })
  type: NotificationType;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type NotificationDocument = HydratedDocument<NotificationSchemaClass>;
export type NotificationLean = NotificationSchemaClass & { _id: string };

export const NotificationSchema = SchemaFactory.createForClass(NotificationSchemaClass);
