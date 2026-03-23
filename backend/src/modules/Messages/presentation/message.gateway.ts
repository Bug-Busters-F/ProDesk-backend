import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: true })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // Acesso à instância principal do servidor Socket.io
    @WebSocketServer()
    server: Server;

    // Método disparado quando um usuário conecta
    handleConnection(client: Socket) {
        console.log(`Usuário conectado: ${client.id}`);
    }

    // Método disparado quando um usuário desconecta
    handleDisconnect(client: Socket) {
        console.log(`Usuário desconectado: ${client.id}`);
    }

    // Listener dos eventos do frontend
    @SubscribeMessage('enviarMensagem')
    handleMessage(
        @MessageBody() data: any, // Dados que o frontend enviou
        @ConnectedSocket() client: Socket,
    ) {
        console.log(`Mensagem recebida de ${client.id}:`, data);

        // TEMPORÁRIO: transmite a mensagem para todos os conectados
        this.server.emit('novaMensagem', data);
    }
}