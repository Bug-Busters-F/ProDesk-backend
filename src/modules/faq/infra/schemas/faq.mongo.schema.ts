import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ collection: 'faqs', timestamps: false })
export class FaqSchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop({ required: true })
    question: string;

    @Prop({ required: true })
    answer: string;

    @Prop({ required: true })
    createdAt: Date;

    @Prop({ type: Date, default: null })
    updatedAt: Date | null;
}

export type FaqDocument = HydratedDocument<FaqSchemaClass>;
export type FaqLean = FaqSchemaClass & { _id: string };

export const FaqSchema = SchemaFactory.createForClass(FaqSchemaClass);