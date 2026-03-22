import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);