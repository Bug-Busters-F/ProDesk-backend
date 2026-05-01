import { Injectable } from "@nestjs/common";
import { IFaqRepository } from "../../domain/repository/faq.repository.interface";

export interface ReadAllFaqOutput {
    id: string;
    question: string;
    answer: string;
    createdAt: Date;
}

@Injectable()
export class ReadAllFaqUseCase {
    constructor(private readonly repository: IFaqRepository) {}

    async execute(): Promise<ReadAllFaqOutput[]> {
        const faqs = await this.repository.readAll();

        return faqs.map((faq) => {
            const primitives = faq.toPrimitives();
            return {
                id: primitives._id,
                question: primitives.question,
                answer: primitives.answer,
                createdAt: primitives.createdAt
            };
        });
    }
}