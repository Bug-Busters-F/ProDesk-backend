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

  // Conexão / Desconexão


  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      // ==========================================
      // BYPASS DE TESTES (Remover em Produção)
      // ==========================================
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
      // ==========================================

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      console.log(`Usuário autenticado conectado: ${client.id} (${payload.email})`);
    } catch {
      console.log(`Conexão recusada — token inválido: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Usuário desconectado: ${client.id}`);
  }


  // Entrar / Sair do Chat


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

    const isParticipant = await this.chatService.isParticipant(
      data.chatId,
      user.id,
    );

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

  // Enviar Mensagem


  @SubscribeMessage('enviarMensagem')
  async handleEnviarMensagem(
    @MessageBody() data: { chatId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data?.user;
    if (!user) {
      client.emit('erroMensagem', { erro: 'Usuário não autenticado' });
      return;
    }

    try {
      // senderId e role vêm do JWT, não do payload do frontend
      const mensagemSalva = await this.chatService.sendMessage(
        data.chatId,
        user.id,
        user.role,
        data.content,
      );

      // Broadcast para todos na sala do chat
      this.server.to(data.chatId).emit('novaMensagem', mensagemSalva);
    } catch (error: any) {
      client.emit('erroMensagem', {
        erro: error.message || 'Não foi possível enviar a mensagem',
      });
    }
  }


  // Buscar Histórico
 

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
