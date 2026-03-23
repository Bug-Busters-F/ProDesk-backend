import { Injectable } from "@nestjs/common";
import { IMessageRepository } from "../domain/message.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Message, MessageDocument } from "./message.schema";
import { Model } from "mongoose";

@Injectable()
export class MessageRepositoryMongodb implements IMessageRepository {
    constructor(
        // Injeta o Model do Mongoose baseado no schema criado
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    ) {}

    // Método para salvar uma nova mensagem no banco
    async create(messageData: any): Promise<Message> {
        const createdMessage = new this.messageModel(messageData);
        return createdMessage.save();
    }

    // Método para buscar todo o histórico de um chamado
    async findByTicketId(ticketId: string): Promise<Message[]> {
        return this.messageModel.find({ ticketId }).sort({ createdAt: 1}).exec();
    }
}