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
import { MessageRepositoryMongodb } from '../infra/message.repository.mongodb';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // Acesso à instância principal do servidor Socket.io
  @WebSocketServer()
  server: Server;

  // Injeta o repositório
  constructor(private readonly messageRepository: MessageRepositoryMongodb) {}

  // Método disparado quando um usuário conecta
  handleConnection(client: Socket) {
    console.log(`Usuário conectado: ${client.id}`);
  }

  // Método disparado quando um usuário desconecta
  handleDisconnect(client: Socket) {
    console.log(`Usuário desconectado: ${client.id}`);
  }

  // Cliente entra na sala do chamado ao abrir o chat
  @SubscribeMessage('entrarChat')
  handleEntrarChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.chatId);
    console.log(`Cliente ${client.id} entrou na sala do chat: ${data.chatId}`);
  }

  // Cliente sai da sala ao fechar o chat
  @SubscribeMessage('sairChat')
  handleSairChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.chatId);
    console.log(`Cliente ${client.id} saiu da sala do chat: ${data.chatId}`);
  }

  // Listener dos eventos do frontend
  @SubscribeMessage('enviarMensagem')
  async handleMessage(
    @MessageBody() data: any, // Dados que o frontend enviou
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Mensagem recebida de ${client.id}:`, data);

    try {
      // Repositório salva a mensagem no banco
      const mensagemSalva = await this.messageRepository.create({
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
        isSystemMessage: data.isSystemMessage || false,
        attachmentUrl: data.attachmentUrl,
        fileIds: data.fileIds || [],
      });

      console.log(`Mensagem salva no banco com ID: ${mensagemSalva.id}`);

      // Emite a mensagem para os clientes dentro da sala do chamado
      this.server.to(data.chatId).emit('novaMensagem', mensagemSalva);
    } catch (error) {
      console.error('Erro ao salvar a mensagem:', error);
      client.emit('erroMensagem', {
        erro: 'Não foi possível salvar a mensagem',
      });
    }
  }
}
