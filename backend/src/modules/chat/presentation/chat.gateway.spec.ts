import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from '../application/chat.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// Mocks

const mockChatService = {
  isParticipant: jest.fn(),
  sendMessage: jest.fn(),
  getChatHistory: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
};

// Cria um socket fake para testes
function createMockSocket(overrides: any = {}): any {
  return {
    id: 'socket-001',
    handshake: {
      auth: { token: undefined },
      headers: { authorization: undefined },
    },
    data: {},
    emit: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
    ...overrides,
  };
}

// Dados de teste

const CHAT_ID = '507f1f77bcf86cd799439055';
const CLIENT_ID = '507f1f77bcf86cd799439022';
const OUTSIDER_ID = '507f1f77bcf86cd799439044';

const validPayload = {
  sub: CLIENT_ID,
  email: 'cliente@email.com',
  role: 'client',
};

// Suite de testes

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);

    // Mock do server para broadcast
    (gateway as any).server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // handleConnection

  describe('handleConnection', () => {
    it('should authenticate and store user data when token is valid (auth.token)', async () => {
      const client = createMockSocket({
        handshake: {
          auth: { token: 'valid-token' },
          headers: {},
        },
      });
      mockJwtService.verifyAsync.mockResolvedValue(validPayload);

      await gateway.handleConnection(client);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(client.data.user).toEqual({
        id: CLIENT_ID,
        email: 'cliente@email.com',
        role: 'client',
      });
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should authenticate when token comes from authorization header', async () => {
      const client = createMockSocket({
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
      });
      mockJwtService.verifyAsync.mockResolvedValue(validPayload);

      await gateway.handleConnection(client);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('header-token');
      expect(client.data.user).toBeDefined();
    });

    it('should disconnect when no token is provided', async () => {
      const client = createMockSocket();

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should disconnect when token is invalid', async () => {
      const client = createMockSocket({
        handshake: {
          auth: { token: 'invalid-token' },
          headers: {},
        },
      });
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });
  });


  // entrarChat

  describe('entrarChat', () => {
    it('should join room when user is a participant', async () => {
      const client = createMockSocket();
      client.data.user = { id: CLIENT_ID, email: 'c@e.com', role: 'client' };
      mockChatService.isParticipant.mockResolvedValue(true);

      await gateway.handleEntrarChat({ chatId: CHAT_ID }, client);

      expect(mockChatService.isParticipant).toHaveBeenCalledWith(CHAT_ID, CLIENT_ID);
      expect(client.join).toHaveBeenCalledWith(CHAT_ID);
      expect(client.emit).toHaveBeenCalledWith('entrou', { chatId: CHAT_ID });
    });

    it('should allow admin to join even if not a participant', async () => {
      const client = createMockSocket();
      client.data.user = { id: OUTSIDER_ID, email: 'a@e.com', role: 'admin' };
      mockChatService.isParticipant.mockResolvedValue(false);

      await gateway.handleEntrarChat({ chatId: CHAT_ID }, client);

      expect(client.join).toHaveBeenCalledWith(CHAT_ID);
    });

    it('should emit error when non-participant tries to join', async () => {
      const client = createMockSocket();
      client.data.user = { id: OUTSIDER_ID, email: 'o@e.com', role: 'client' };
      mockChatService.isParticipant.mockResolvedValue(false);

      await gateway.handleEntrarChat({ chatId: CHAT_ID }, client);

      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('erro', {
        mensagem: 'Você não é participante deste chat',
      });
    });

    it('should emit error when user is not authenticated', async () => {
      const client = createMockSocket();
      // client.data.user is undefined

      await gateway.handleEntrarChat({ chatId: CHAT_ID }, client);

      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('erro', {
        mensagem: 'Usuário não autenticado',
      });
    });
  });

  // enviarMensagem

  describe('enviarMensagem', () => {
    const mockSavedMessage = {
      id: 'msg-001',
      chatId: CHAT_ID,
      senderId: CLIENT_ID,
      content: 'Olá, preciso de ajuda!',
      isSystemMessage: false,
      createdAt: new Date(),
    };

    it('should save message and broadcast to room', async () => {
      const client = createMockSocket();
      client.data.user = { id: CLIENT_ID, email: 'c@e.com', role: 'client' };
      mockChatService.sendMessage.mockResolvedValue(mockSavedMessage);

      await gateway.handleEnviarMensagem(
        { chatId: CHAT_ID, content: 'Olá, preciso de ajuda!' },
        client,
      );

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        CHAT_ID,
        CLIENT_ID,
        'client',
        'Olá, preciso de ajuda!',
      );
      expect((gateway as any).server.to).toHaveBeenCalledWith(CHAT_ID);
    });

    it('should emit error when sendMessage throws ForbiddenException', async () => {
      const client = createMockSocket();
      client.data.user = { id: OUTSIDER_ID, email: 'o@e.com', role: 'client' };
      mockChatService.sendMessage.mockRejectedValue(
        new ForbiddenException('You are not a participant of this chat'),
      );

      await gateway.handleEnviarMensagem(
        { chatId: CHAT_ID, content: 'Intruso!' },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith('erroMensagem', {
        erro: 'You are not a participant of this chat',
      });
    });

    it('should emit error when user is not authenticated', async () => {
      const client = createMockSocket();

      await gateway.handleEnviarMensagem(
        { chatId: CHAT_ID, content: 'Sem auth' },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith('erroMensagem', {
        erro: 'Usuário não autenticado',
      });
      expect(mockChatService.sendMessage).not.toHaveBeenCalled();
    });
  });


  // buscarHistorico
 
  describe('buscarHistorico', () => {
    const mockMessages = [
      { chatId: CHAT_ID, senderId: CLIENT_ID, content: 'Oi', createdAt: new Date() },
    ];

    it('should emit chat history to the client', async () => {
      const client = createMockSocket();
      client.data.user = { id: CLIENT_ID, email: 'c@e.com', role: 'client' };
      mockChatService.getChatHistory.mockResolvedValue(mockMessages);

      await gateway.handleBuscarHistorico({ chatId: CHAT_ID }, client);

      expect(mockChatService.getChatHistory).toHaveBeenCalledWith(
        CHAT_ID,
        CLIENT_ID,
        'client',
      );
      expect(client.emit).toHaveBeenCalledWith('historicoChat', {
        chatId: CHAT_ID,
        mensagens: mockMessages,
      });
    });

    it('should emit error when getChatHistory throws', async () => {
      const client = createMockSocket();
      client.data.user = { id: OUTSIDER_ID, email: 'o@e.com', role: 'client' };
      mockChatService.getChatHistory.mockRejectedValue(
        new ForbiddenException('You are not a participant of this chat'),
      );

      await gateway.handleBuscarHistorico({ chatId: CHAT_ID }, client);

      expect(client.emit).toHaveBeenCalledWith('erro', {
        mensagem: 'You are not a participant of this chat',
      });
    });
  });


  // sairChat

  describe('sairChat', () => {
    it('should leave the chat room', () => {
      const client = createMockSocket();
      client.data.user = { id: CLIENT_ID, email: 'c@e.com', role: 'client' };

      gateway.handleSairChat({ chatId: CHAT_ID }, client);

      expect(client.leave).toHaveBeenCalledWith(CHAT_ID);
    });
  });
});
