import { Injectable, NotFoundException } from "@nestjs/common";
import { IFaqRepository } from "../../domain/repository/faq.repository.interface";

export interface UpdateFaqInput {
    id: string;
    question?: string;
    answer?: string;
}

export interface UpdateFaqOutput {
    id: string;
    question: string;
    answer: string;
    updatedAt: Date | null;
}

@Injectable()
export class UpdateFaqUseCase {
    constructor(private readonly repository: IFaqRepository) {}

    async execute(input: UpdateFaqInput): Promise<UpdateFaqOutput> {
        const faq = await this.repository.readById(input.id);

        if (!faq) throw new NotFoundException('FAQ not found');

        faq.update({ question: input.question, answer: input.answer });

        const updated = await this.repository.update(faq);
        if (!updated) throw new NotFoundException('FAQ not found');
        const primitives = updated.toPrimitives();

        return {
            id: primitives._id,
            question: primitives.question,
            answer: primitives.answer,
            updatedAt: primitives.updatedAt
        };
    }
}