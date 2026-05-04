import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccessRequestDocument = AccessRequest & Document;

@Schema({ timestamps: true })
export class AccessRequest {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  cnpj: string;

  @Prop({
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;
}

export const AccessRequestSchema =
  SchemaFactory.createForClass(AccessRequest);