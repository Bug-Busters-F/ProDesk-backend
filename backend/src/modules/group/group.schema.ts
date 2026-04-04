import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
