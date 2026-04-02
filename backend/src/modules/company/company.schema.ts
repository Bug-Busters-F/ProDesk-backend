import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CompanyDocument = HydratedDocument<Company>;

@Schema()
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  cnpj: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);