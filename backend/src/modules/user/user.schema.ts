import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Company } from '../company/company.schema';
import { Category } from '../category/category.schema';

export type UserDocument = User & Document;

export enum UserRole {
  CLIENT = 'client',
  SUPPORT = 'support',
  ADMIN = 'admin',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Prop({
    required: false,
    default: 1
  })
  level: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: false,
  })
  companyId: Types.ObjectId | Company;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Category' }],
    required: false,
    default: [],
  })
  categories: (Types.ObjectId | Category)[];

  createdAt?: Date;

  @Prop({ required: false })
  profileImage?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);