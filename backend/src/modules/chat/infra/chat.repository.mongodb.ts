import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';
import { IChatRepository } from '../domain/chat.repository';
import { ChatDetails, ChatStatus } from '../domain/chat.entity';

@Injectable()
export class ChatRepositoryMongodb implements IChatRepository {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {}

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

  async create(data: {
    ticketId: string;
    clientId: string;
    agentId: string;
    groupId: string;
  }): Promise<ChatDetails> {
    const createdChat = new this.chatModel(data);
    const saved = await createdChat.save();
    return this.toDetails(saved);
  }

  async findById(id: string): Promise<ChatDetails | null> {
    const doc = await this.chatModel.findById(id).exec();
    if (!doc) return null;
    return this.toDetails(doc);
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

  async findByTicketId(ticketId: string): Promise<ChatDetails | null> {
    const doc = await this.chatModel.findOne({ ticketId }).exec();
    if (!doc) return null;
    return this.toDetails(doc);
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
}
