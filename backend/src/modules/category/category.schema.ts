import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Group } from '../group/group.schema';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  keywords: string[];

  @Prop({ required: true })
  trainingPhrases: string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Group' }],
    required: false,
  })
  groupIds: (Types.ObjectId | Group)[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
