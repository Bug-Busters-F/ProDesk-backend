import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';


export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  keywords: string[];

  @Prop({ required: true })
  trainingPhrases: string[];

}

export const CategorySchema = SchemaFactory.createForClass(Category);
