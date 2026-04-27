import { randomUUID } from "crypto";

export class Faq {
    private _id: string;
    private _question: string;
    private _answer: string;
    private _createdAt: Date;
    private _updatedAt: Date | null = null;

    constructor(question: string, answer: string) {
        this._question = question;
        this._answer = answer;
    }

    get id() { return this._id; }

    get question() { return this._question; }

    get answer() { return this._answer; }

    get createdAt() { return this._createdAt; }

    get updatedAt() { return this._updatedAt; }

    static create(props: { question: string; answer: string }): Faq {
        const faq = new Faq(props.question, props.answer);
        faq._id = randomUUID();
        faq._createdAt = new Date();
        return faq;
    }

    static restore(props: {
        _id: string;
        question: string;
        answer: string;
        createdAt: Date;
        updatedAt?: Date | null;
    }): Faq {
        const faq = new Faq(props.question, props.answer);
        faq._id = props._id;
        faq._createdAt = props.createdAt;
        faq._updatedAt = props.updatedAt ?? null;
        return faq;
    }

    update(props: { question?: string; answer?: string }): void {
        if (props.question) this._question = props.question;
        if (props.answer) this._answer = props.answer;
        this._updatedAt = new Date();
    }

    toPrimitives() {
        return {
            _id: this._id,
            question: this._question,
            answer: this._answer,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}