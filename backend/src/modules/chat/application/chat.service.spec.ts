import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { TicketSchemaClass } from '../../ticket/infra/schemas/ticket.mongo.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatDetails, ChatStatus } from '../domain/chat.entity';
import { IChatRepository } from '../domain/chat.repository';
import { IMessageRepository } from '../../Messages/domain/message.repository';
import { UserRole } from '../../user/user.schema';

const mockChatRepository: jest.Mocked<IChatRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByParticipant: jest.fn(),
  findByTicketId: jest.fn(),
  updateStatus: jest.fn(),
  updateAgent: jest.fn(),
};

const mockMessageRepository: jest.Mocked<IMessageRepository> = {
  create: jest.fn(),
  findByChatId: jest.fn(),
};

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

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: 'IChatRepository', useValue: mockChatRepository },
        { provide: 'IMessageRepository', useValue: mockMessageRepository },
        { provide: getModelToken(TicketSchemaClass.name), useValue: {} },
        { provide: getModelToken(UserRole.ADMIN ? 'User' : 'User'), useValue: {} }, // Gambiarra provisória pra obter a string 'User'
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChat', () => {
    it('should create a chat and return its details', async () => {
      mockChatRepository.create.mockResolvedValue(mockChat);

      const result = await service.createChat(
        TICKET_ID,
        CLIENT_ID,
        AGENT_ID,
        GROUP_ID,
      );

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
        fileIds: [],
        attachmentUrl: undefined,
        type: 'TEXT',
      });
    });

    it('should allow ADMIN to send message even if not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockMessageRepository.create.mockResolvedValue(mockSavedMessage as any);

      const result = await service.sendMessage(
        CHAT_ID,
        OUTSIDER_ID,
        UserRole.ADMIN,
        'Mensagem do admin',
      );

      expect(result).toBeDefined();
      expect(mockMessageRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException when SUPPORT tries to send message and is not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      await expect(
        service.sendMessage(CHAT_ID, OUTSIDER_ID, UserRole.SUPPORT, 'Intruso suporte!'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when sender is not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      await expect(
        service.sendMessage(CHAT_ID, OUTSIDER_ID, UserRole.CLIENT, 'Intruso!'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when chat does not exist', async () => {
      mockChatRepository.findById.mockResolvedValue(null);

      await expect(
        service.sendMessage('nonexistent', CLIENT_ID, UserRole.CLIENT, 'Oi'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getChatHistory', () => {
    const mockMessages = [
      {
        chatId: CHAT_ID,
        senderId: CLIENT_ID,
        content: 'Oi',
        createdAt: new Date(),
      },
    ];

    it('should return messages when user is a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockMessageRepository.findByChatId.mockResolvedValue(mockMessages as any);

      const result = await service.getChatHistory(
        CHAT_ID,
        CLIENT_ID,
        UserRole.CLIENT,
      );

      expect(result).toEqual(mockMessages);
      expect(mockMessageRepository.findByChatId).toHaveBeenCalledWith(CHAT_ID);
    });

    it('should allow ADMIN to view history even if not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockMessageRepository.findByChatId.mockResolvedValue(mockMessages as any);

      const result = await service.getChatHistory(
        CHAT_ID,
        OUTSIDER_ID,
        UserRole.ADMIN,
      );

      expect(result).toEqual(mockMessages);
    });

    it('should throw ForbiddenException when SUPPORT tries to view history and is not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      await expect(
        service.getChatHistory(CHAT_ID, OUTSIDER_ID, UserRole.SUPPORT),
      ).rejects.toThrow(ForbiddenException);

      expect(mockMessageRepository.findByChatId).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not a participant', async () => {
      mockChatRepository.findById.mockResolvedValue(mockChat);

      await expect(
        service.getChatHistory(CHAT_ID, OUTSIDER_ID, UserRole.CLIENT),
      ).rejects.toThrow(ForbiddenException);

      expect(mockMessageRepository.findByChatId).not.toHaveBeenCalled();
    });
  });

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
  });

  describe('getChatsByUser', () => {
    it('should return all chats where user is a participant', async () => {
      const chats = [mockChat];
      mockChatRepository.findByParticipant.mockResolvedValue(chats);

      const result = await service.getChatsByUser(CLIENT_ID);

      expect(result).toEqual(chats);
      expect(mockChatRepository.findByParticipant).toHaveBeenCalledWith(
        CLIENT_ID,
      );
    });
  });
});