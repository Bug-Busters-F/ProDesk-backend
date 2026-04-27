import { Faq } from "../../domain/entities/faq.entity";
import { FaqDocument, FaqLean } from "../schemas/faq.mongo.schema";

export class FaqMapper {
    static toDomain(doc: FaqDocument | FaqLean): Faq {
        return Faq.restore({
            _id: doc._id.toString(),
            question: doc.question,
            answer: doc.answer,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistance(faq: Faq): Record<string, any> {
        return faq.toPrimitives();
    }
}