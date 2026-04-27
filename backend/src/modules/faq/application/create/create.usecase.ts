import { Injectable } from "@nestjs/common";
import { IFaqRepository } from "../../domain/repository/faq.repository.interface";
import { Faq } from "../../domain/entities/faq.entity";

export interface CreateFaqInput {
    question: string;
    answer: string;
}

export interface CreateFaqOutput {
    id: string;
    question: string;
    answer: string;
    createdAt: Date;
}

@Injectable()
export class CreateFaqUseCase {
    constructor(private readonly repository: IFaqRepository) {}

    async execute(input: CreateFaqInput): Promise<CreateFaqOutput> {
        const faq = Faq.create(input);
        const created = await this.repository.create(faq);
        const primitives = created.toPrimitives();

        return {
            id: primitives._id,
            question: primitives.question,
            answer: primitives.answer,
            createdAt: primitives.createdAt
        };
    }
}