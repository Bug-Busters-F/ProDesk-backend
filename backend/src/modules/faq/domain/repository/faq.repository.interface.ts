import { Faq } from "../entities/faq.entity";


export abstract class IFaqRepository {
    abstract create(faq: Faq): Promise<Faq>;
    abstract update(faq: Faq): Promise<Faq | null>;
    abstract delete(id: string): Promise<boolean>;
    abstract readAll(): Promise<Faq[]>;
    abstract readById(id: string): Promise<Faq | null>;
}