import { CreateFaqInput } from "../../application/create/create.usecase";
import { UpdateFaqInput } from "../../application/update/update.usecase";
import { CreateFaqRequest } from "../dtos/create.dto";
import { UpdateFaqRequest } from "../dtos/update.dto";

export class FaqMapper {
    static toCreateInput(req: CreateFaqRequest): CreateFaqInput {
        return {
            question: req.question,
            answer: req.answer
        };
    }

    static toUpdateInput(id: string, req: UpdateFaqRequest): UpdateFaqInput {
        return {
            id,
            question: req.question,
            answer: req.answer
        };
    }
}