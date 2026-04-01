import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MessageService } from '../application/message.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':chatId')
  @ApiOperation({ summary: 'Obter histórico de mensagens de um chamado' })
  @ApiParam({ name: 'chatId', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Histórico de mensagens retornado com sucesso' })
  async getChatHistory(@Param('chatId') chatId: string) {
    return this.messageService.getChatHistory(chatId);
  }
}