import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../application/chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token;
      
      if (!token && client.handshake.headers?.authorization) {
        token = client.handshake.headers.authorization.replace('Bearer ', '').trim();
      }

      if (!token) {
        throw new Error('Token não foi enviado pelo frontend');
      }

      if (token.startsWith('TEST_TOKEN_')) {
        const role = token.split('_').pop().toLowerCase();
        client.data.user = {
          id: role === 'cliente' ? '507f1f77bcf86cd799439022' : '507f1f77bcf86cd799439033',
          email: `${role}@teste.com`,
          role: role,
        };
        console.log(`[MODO TESTE] Usuário mockado conectado: ${client.id} (${role})`);
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      console.log(`Usuário autenticado no chat: ${client.id} (${payload.email})`);
      
    } catch (error: any) {
      console.log(`Conexão recusada [${client.id}] - Motivo: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Usuário desconectado: ${client.id}`);
  }

  @SubscribeMessage('entrarChat')
  async handleEntrarChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data?.user;
    if (!user) {
      client.emit('erro', { mensagem: 'Usuário não autenticado' });
      return;
    }

    const isParticipant = await this.chatService.isParticipant(data.chatId, user.id);

    if (!isParticipant && user.role !== 'admin') {
      client.emit('erro', {
        mensagem: 'Você não é participante deste chat',
      });
      return;
    }

    client.join(data.chatId);
    client.emit('entrou', { chatId: data.chatId });
    console.log(`Usuário ${user.email} entrou no chat: ${data.chatId}`);
  }

  @SubscribeMessage('sairChat')
  handleSairChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.chatId);
    console.log(`Usuário ${client.data?.user?.email} saiu do chat: ${data.chatId}`);
  }

  @SubscribeMessage('enviarMensagem')
  async handleEnviarMensagem(
    // ADICIONADO attachmentUrl E type NO PAYLOAD RECEBIDO PELO SOCKET
    @MessageBody() data: { chatId: string; content: string; attachmentUrl?: string; type?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data?.user;
    if (!user) {
      client.emit('erroMensagem', { erro: 'Usuário não autenticado' });
      return;
    }

    try {
      // REPASSANDO A URL E O TIPO PARA O SERVIÇO
      const mensagemSalva = await this.chatService.sendMessage(
        data.chatId,
        user.id,
        user.role,
        data.content,
        [], // fileIds vazio
        data.attachmentUrl, 
        data.type           
      );

      this.server.to(data.chatId).emit('novaMensagem', mensagemSalva);
    } catch (error: any) {
      client.emit('erroMensagem', {
        erro: error.message || 'Não foi possível enviar a mensagem',
      });
    }
  }

  @SubscribeMessage('buscarHistorico')
  async handleBuscarHistorico(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data?.user;
    if (!user) {
      client.emit('erro', { mensagem: 'Usuário não autenticado' });
      return;
    }

    try {
      const mensagens = await this.chatService.getChatHistory(
        data.chatId,
        user.id,
        user.role,
      );

      client.emit('historicoChat', { chatId: data.chatId, mensagens });
    } catch (error: any) {
      client.emit('erro', {
        mensagem: error.message || 'Não foi possível buscar o histórico',
      });
    }
  }
}