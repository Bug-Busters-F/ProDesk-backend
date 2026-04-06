import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { ChatService } from '../application/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() body: { ticketId: string, clientId: string, agentId: string, groupId: string }) {
    return this.chatService.createChat(body.ticketId, body.clientId, body.agentId, body.groupId);
  }

  @Get('ticket/:ticketId')
  async getChatByTicket(@Param('ticketId') ticketId: string) {
    const chat = await (this.chatService as any).chatRepository.findByTicketId(ticketId);
    if (!chat) throw new NotFoundException('Chat não encontrado');
    return chat;
  }
}