import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Company } from "../company/company.schema";
import { Group } from "../group/group.schema";

export type UserDocument = User & Document;

export enum UserRole {
  CLIENT = "client",
  SUPPORT = "support",
  ADMIN = "admin",
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
    default: UserRole.CLIENT
  })
  role: UserRole;

  @Prop({ 
    type: Types.ObjectId, 
    ref: "Company",
    required: false
  })
  companyId: Types.ObjectId | Company;

  @Prop({ 
    type: Types.ObjectId, 
    ref: "Group",
    required: false
  })
  groupId: Types.ObjectId | Group;

  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);