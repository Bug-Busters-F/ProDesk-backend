import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { IFaqRepository } from "../../domain/repository/faq.repository.interface";
import { FaqLean, FaqSchemaClass } from "../schemas/faq.mongo.schema";
import { Model } from "mongoose";
import { Faq } from "../../domain/entities/faq.entity";
import { FaqMapper } from "../mappers/faq.mapper";

@Injectable()
export class FaqMongoRepository extends IFaqRepository {
    constructor(
        @InjectModel(FaqSchemaClass.name)
        private readonly faqModel: Model<FaqSchemaClass>,
    ) {
        super();
    }

    async create(faq: Faq): Promise<Faq> {
        const raw = FaqMapper.toPersistance(faq);
        const created = await this.faqModel.create(raw);
        return FaqMapper.toDomain(created);
    }

    async update(faq: Faq): Promise<Faq | null> {
        const raw = FaqMapper.toPersistance(faq);
        const updated = await this.faqModel
            .findOneAndUpdate(
                { _id: raw._id },
                { $set: raw },
                { returnDocument: 'after' },
            )
            .lean<FaqLean>()
            .exec();

        if (!updated) return null;

        return FaqMapper.toDomain(updated);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.faqModel.findByIdAndDelete(id);
        return result !== null;
    }

    async readAll(): Promise<Faq[]> {
        const faqs = await this.faqModel.find().lean<FaqLean[]>().exec();
        return faqs.map((f) => FaqMapper.toDomain(f));
    }

    async readById(id: string): Promise<Faq | null> {
        const faq = await this.faqModel.findById(id).lean<FaqLean>().exec();
        if (!faq) return null;
        return FaqMapper.toDomain(faq);
    }
}