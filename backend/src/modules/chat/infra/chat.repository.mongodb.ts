import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';
import { IChatRepository } from '../domain/chat.repository';
import { ChatDetails, ChatStatus } from '../domain/chat.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ChatRepositoryMongodb implements IChatRepository {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  private toDetails(doc: ChatDocument): ChatDetails {
    return {
      id: doc._id?.toString() || '',
      ticketId: doc.ticketId?.toString() || '',
      clientId: doc.clientId?.toString() || '',
      agentId: doc.agentId?.toString() || '',
      groupId: doc.groupId?.toString() || '',
      status: doc.status as ChatStatus,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }

  async create(chat: ChatDetails): Promise<ChatDetails> {
    const newChat = new this.chatModel({
      _id: randomUUID(),
      ticketId: chat.ticketId,
      clientId: chat.clientId,
      agentId: chat.agentId,
      groupId: chat.groupId,
      status: chat.status,
    });
    
    await newChat.save();
    return this.toDetails(newChat);
  }

  async findById(id: string): Promise<ChatDetails | null> {
    const chatDoc = await this.chatModel.findById(id).exec();
         
    if (!chatDoc) return null;
    return {
      id: chatDoc._id as string,
      ticketId: chatDoc.ticketId?.toString() || '',
      clientId: chatDoc.clientId?.toString() || '',
      agentId: chatDoc.agentId?.toString() || '', 
      groupId: chatDoc.groupId?.toString() || '',
      status: chatDoc.status as any,
    };
  }

  async findByTicketId(ticketId: string): Promise<ChatDetails | null> {
    const chatDoc = await this.chatModel.findOne({ ticketId }).exec();
         
    if (!chatDoc) return null;
    return {
      id: chatDoc._id as string,
      ticketId: chatDoc.ticketId?.toString() || '',
      clientId: chatDoc.clientId?.toString() || '',
      agentId: chatDoc.agentId?.toString() || '', 
      groupId: chatDoc.groupId?.toString() || '',
      status: chatDoc.status as any,
    };
  }

  async findByParticipant(userId: string): Promise<ChatDetails[]> {
    const docs = await this.chatModel
      .find({
        $or: [{ clientId: userId }, { agentId: userId }],
      })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toDetails(doc));
  }

  async updateStatus(
    id: string,
    status: ChatStatus,
  ): Promise<ChatDetails | null> {
    const doc = await this.chatModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!doc) return null;
    return this.toDetails(doc);
  }

  async updateAgent(ticketId: string, agentId: string | null): Promise<ChatDetails | null> {
    const doc = await this.chatModel
      .findOneAndUpdate({ ticketId }, { agentId }, { new: true })
      .exec();
    if (!doc) return null;
    return this.toDetails(doc);
  }
}
