import { Message, MessageDocument } from "../infra/message.schema";

export interface IMessageRepository {
    create(messageData: any): Promise<MessageDocument>;
    findByChatId(chatId: string): Promise<Message[]>;
}