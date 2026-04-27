import { Injectable, NotFoundException } from "@nestjs/common";
import { IFaqRepository } from "../../domain/repository/faq.repository.interface";

export interface ReadByIdFaqOutput {
    id: string;
    question: string;
    answer: string;
    createdAt: Date;
    updatedAt: Date | null;
}

@Injectable()
export class ReadByIdFaqUseCase {
    constructor(private readonly repository: IFaqRepository) {}

    async execute(id: string): Promise<ReadByIdFaqOutput> {
        const faq = await this.repository.readById(id);

        if (!faq) throw new NotFoundException('FAQ not found');

        const primitives = faq.toPrimitives();

        return {
            id: primitives._id,
            question: primitives.question,
            answer: primitives.answer,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt
        };
    }
}