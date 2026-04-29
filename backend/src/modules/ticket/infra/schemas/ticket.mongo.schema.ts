import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

import {
  TicketEventMessage,
  TicketEvents,
  TicketPriority,
  TicketStatus,
} from '../../domain/entities/ticket.entity';

@Schema({ _id: false })
export class TicketHistoryEntrySchema {
  @Prop({ required: true, enum: Object.values(TicketEvents) })
  event: string;

  @Prop({ type: String, default: null })
  responsibleAgent: string | null;

  @Prop({ required: true, enum: Object.values(TicketStatus) })
  status: string;

  @Prop({ required: true, enum: Object.values(TicketEventMessage) })
  message: string;

  @Prop({ type: String, default: null })
  solution: string | null;
  
  @Prop({ type: String, required: false })
  attachmentUrl?: string;

  @Prop({ required: true })
  occurredAt: Date;
}

const TicketHistoryEntrySchemaFactory = SchemaFactory.createForClass(
  TicketHistoryEntrySchema,
);

@Schema({ collection: 'tickets', timestamps: false })
export class TicketSchemaClass {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: Object.values(TicketPriority) })
  priority: string;

  @Prop({
    required: true,
    default: TicketStatus.OPEN,
    enum: Object.values(TicketStatus),
  })
  status: string;

  @Prop({ type: [TicketHistoryEntrySchemaFactory], default: [] })
  history: TicketHistoryEntrySchema[];

  @Prop({ required: true })
  clientId: string;

  @Prop({ type: String, default: null })
  agentId: string | null;

  @Prop({ default: 1 })
  escalationLevel: number;

  @Prop({ type: [String], default: [] })
  attachmentsUrls: string[];

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  updatedAt: Date | null;

  @Prop({ type: Date, default: null })
  closedAt: Date | null;
}

export type TicketDocument = HydratedDocument<TicketSchemaClass>;

export type TicketLean = TicketSchemaClass & { _id: string };

export const TicketSchema = SchemaFactory.createForClass(TicketSchemaClass);
