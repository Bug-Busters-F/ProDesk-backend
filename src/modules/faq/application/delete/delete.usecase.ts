import { Injectable, NotFoundException } from "@nestjs/common";
import { IFaqRepository } from "../../domain/repository/faq.repository.interface";

@Injectable()
export class DeleteFaqUseCase {
    constructor(private readonly repository: IFaqRepository) {}

    async execute(id: string): Promise<void> {
        const faq = await this.repository.readById(id);

        if (!faq) throw new NotFoundException('FAQ not found');

        await this.repository.delete(id);
    }
}