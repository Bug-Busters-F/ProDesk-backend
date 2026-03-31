import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service.js';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatDetails, ChatStatus } from '../domain/chat.entity.js';
import { IChatRepository } from '../domain/chat.repository.js';
import { IMessageRepository } from '../../Messages/domain/message.repository.js';
import { UserRole } from '../../user/user.schema.js';


const mockChatRepository: jest.Mocked<IChatRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByParticipant: jest.fn(),
  findByTicketId: jest.fn(),
  updateStatus: jest.fn(),
};

const mockMessageRepository: jest.Mocked<IMessageRepository> = {
  create: jest.fn(),
  findByChatId: jest.fn(),
};


// Dados de teste reutilizáveis


const TICKET_ID = '507f1f77bcf86cd799439011';
const CLIENT_ID = '507f1f77bcf86cd799439022';
const AGENT_ID = '507f1f77bcf86cd799439033';
const GROUP_ID = '507f1f77bcf86cd799439034';
const OUTSIDER_ID = '507f1f77bcf86cd799439044';
const CHAT_ID = '507f1f77bcf86cd799439055';

const mockChat: ChatDetails = {
  id: CHAT_ID,
  ticketId: TICKET_ID,
  clientId: CLIENT_ID,
  agentId: AGENT_ID,
  groupId: GROUP_ID,
  status: ChatStatus.OPEN,
  createdAt: new Date('2026-01-01'),
};


// Suite de testes


describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    // Cria um módulo de teste NestJS com o ChatService real
    // mas com mocks no lugar dos repositórios
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: 'IChatRepository',
          useValue: mockChatRepository,
        },
        {
          provide: 'IMessageRepository',
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);

    // Limpa todos os mocks entre cada teste
    jest.clearAllMocks();
  });

  // O service deve ser instanciado corretamente
  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  // createChat

  describe('createChat', () => {
    it('should create a chat and return its details', async () => {
      // Arrange: configura o mock para retornar o chat esperado
      mockChatRepository.create.mockResolvedValue(mockChat);

      // Act: chama o método
      const result = await service.createChat(TICKET_ID, CLIENT_ID, AGENT_ID, GROUP_ID);

      // Assert: verifica o resultado
      expect(result).toEqual(mockChat);
      expect(mockChatRepository.create).toHaveBeenCalledWith({
        ticketId: TICKET_ID,
        clientId: CLIENT_ID,
        agentId: AGENT_ID,
        groupId: GROUP_ID,
      });
      expect(mockChatRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  // getChatById
  describe('getChatById', () => {
    it('should return chat details when chat exists', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      const result = await service.getChatById(CHAT_ID);

      expect(result).toEqual(mockChat);
      expect(mockChatRepository.findById).toHaveBeenCalledWith(CHAT_ID);
    });

    it('should throw NotFoundException when chat does not exist', async () => {
      mockChatRepository.findById.mockResolvedValue(null);

      await expect(service.getChatById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // isParticipant
  describe('isParticipant', () => {
    it('should return true when userId is the clientId', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      const result = await service.isParticipant(CHAT_ID, CLIENT_ID);

      expect(result).toBe(true);
    });

    it('should return true when userId is the agentId', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      const result = await service.isParticipant(CHAT_ID, AGENT_ID);

      expect(result).toBe(true);
    });

    it('should return false when userId is not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      const result = await service.isParticipant(CHAT_ID, OUTSIDER_ID);

      expect(result).toBe(false);
    });

    it('should return false when chat does not exist', async () => {
      mockChatRepository.findById.mockResolvedValue(null);

      const result = await service.isParticipant('nonexistent', CLIENT_ID);

      expect(result).toBe(false);
    });
  });


  // sendMessage

  describe('sendMessage', () => {
    const mockSavedMessage = {
      id: 'msg-001',
      chatId: CHAT_ID,
      senderId: CLIENT_ID,
      content: 'Olá, preciso de ajuda!',
      isSystemMessage: false,
      createdAt: new Date(),
    };

    it('should save and return the message when sender is a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockMessageRepository.create.mockResolvedValue(mockSavedMessage as any);

      const result = await service.sendMessage(
        CHAT_ID,
        CLIENT_ID,
        UserRole.CLIENT,
        'Olá, preciso de ajuda!',
      );

      expect(result).toEqual(mockSavedMessage);
      expect(mockMessageRepository.create).toHaveBeenCalledWith({
        chatId: CHAT_ID,
        senderId: CLIENT_ID,
        content: 'Olá, preciso de ajuda!',
        isSystemMessage: false,
      });
    });

    it('should allow ADMIN to send message even if not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockMessageRepository.create.mockResolvedValue(mockSavedMessage as any);

      // ADMIN não é participante direto mas tem permissão
      const result = await service.sendMessage(
        CHAT_ID,
        OUTSIDER_ID,
        UserRole.ADMIN,
        'Mensagem do admin',
      );

      expect(result).toBeDefined();
      expect(mockMessageRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException when sender is not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      await expect(
        service.sendMessage(CHAT_ID, OUTSIDER_ID, UserRole.CLIENT, 'Intruso!'),
      ).rejects.toThrow(ForbiddenException);

      // Garante que a mensagem NÃO foi salva
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when chat does not exist', async () => {
      mockChatRepository.findById.mockResolvedValue(null);

      await expect(
        service.sendMessage('nonexistent', CLIENT_ID, UserRole.CLIENT, 'Oi'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // getChatHistory
  describe('getChatHistory', () => {
    const mockMessages = [
      { chatId: CHAT_ID, senderId: CLIENT_ID, content: 'Oi', createdAt: new Date() },
      { chatId: CHAT_ID, senderId: AGENT_ID, content: 'Olá!', createdAt: new Date() },
    ];

    it('should return messages when user is a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockMessageRepository.findByChatId.mockResolvedValue(mockMessages as any);

      const result = await service.getChatHistory(CHAT_ID, CLIENT_ID, UserRole.CLIENT);

      expect(result).toEqual(mockMessages);
      expect(mockMessageRepository.findByChatId).toHaveBeenCalledWith(CHAT_ID);
    });

    it('should allow ADMIN to view history even if not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockMessageRepository.findByChatId.mockResolvedValue(mockMessages as any);

      const result = await service.getChatHistory(CHAT_ID, OUTSIDER_ID, UserRole.ADMIN);

      expect(result).toEqual(mockMessages);
    });

    it('should throw ForbiddenException when user is not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      await expect(
        service.getChatHistory(CHAT_ID, OUTSIDER_ID, UserRole.CLIENT),
      ).rejects.toThrow(ForbiddenException);

      expect(mockMessageRepository.findByChatId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when chat does not exist', async () => {
      mockChatRepository.findById.mockResolvedValue(null);

      await expect(
        service.getChatHistory('nonexistent', CLIENT_ID, UserRole.CLIENT),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // closeChat
  describe('closeChat', () => {
    it('should close the chat and return updated details', async () => {
      const closedChat = { ...mockChat, status: ChatStatus.CLOSED };
      mockChatRepository.updateStatus.mockResolvedValue(closedChat);

      const result = await service.closeChat(CHAT_ID);

      expect(result.status).toBe(ChatStatus.CLOSED);
      expect(mockChatRepository.updateStatus).toHaveBeenCalledWith(
        CHAT_ID,
        ChatStatus.CLOSED,
      );
    });

    it('should throw NotFoundException when chat does not exist', async () => {
      mockChatRepository.updateStatus.mockResolvedValue(null);

      await expect(service.closeChat('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // getChatsByUser
  describe('getChatsByUser', () => {
    it('should return all chats where user is a participant', async () => {
      const chats = [mockChat];
      mockChatRepository.findByParticipant.mockResolvedValue(chats);

      const result = await service.getChatsByUser(CLIENT_ID);

      expect(result).toEqual(chats);
      expect(mockChatRepository.findByParticipant).toHaveBeenCalledWith(CLIENT_ID);
    });

    it('should return empty array when user has no chats', async () => {
      mockChatRepository.findByParticipant.mockResolvedValue([]);

      const result = await service.getChatsByUser(OUTSIDER_ID);

      expect(result).toEqual([]);
    });
  });
});
