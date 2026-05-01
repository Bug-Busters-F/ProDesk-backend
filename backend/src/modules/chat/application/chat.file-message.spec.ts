import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { TicketSchemaClass } from '../../ticket/infra/schemas/ticket.mongo.schema';
import { UserRole } from '../../user/user.schema';
import { NotFoundException } from '@nestjs/common';

import type { IChatRepository } from '../domain/chat.repository';
import type { IMessageRepository } from '../../Messages/domain/message.repository';

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

const CHAT_ID = 'chat-001';
const CLIENT_ID = 'user-001';

const mockChat = {
  id: CHAT_ID,
  ticketId: 'ticket-001',
  clientId: CLIENT_ID,
  agentId: 'agent-001',
  groupId: 'group-001',
  status: 'open',
  createdAt: new Date(),
};

describe('ChatService — envio de mensagem com arquivo', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: 'IChatRepository', useValue: mockChatRepository },
        { provide: 'IMessageRepository', useValue: mockMessageRepository },
        { provide: getModelToken(TicketSchemaClass.name), useValue: {} },
        { provide: getModelToken(UserRole.ADMIN ? 'User' : 'User'), useValue: {} },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  it('should send message with attached file', async () => {
    const FILE_ID = 'file-001';
    const mockSavedMessage = {
      id: 'msg-001',
      chatId: CHAT_ID,
      senderId: CLIENT_ID,
      content: 'Arquivo anexado',
      fileIds: [FILE_ID],
      isSystemMessage: false,
      createdAt: new Date(),
    };

    mockChatRepository.findById.mockResolvedValue(mockChat as any);
    mockMessageRepository.create.mockResolvedValue(mockSavedMessage as any);

    const result = await service.sendMessage(
      CHAT_ID,
      CLIENT_ID,
      UserRole.CLIENT,
      'Arquivo anexado',
      [FILE_ID],
    );

    expect(result).toEqual(mockSavedMessage);
    expect(mockMessageRepository.create).toHaveBeenCalledWith({
      chatId: CHAT_ID,
      senderId: CLIENT_ID,
      content: 'Arquivo anexado',
      isSystemMessage: false,
      fileIds: [FILE_ID],
      attachmentUrl: undefined,
      type: 'TEXT',
    });
  });

  it('should send message without fileIds', async () => {
    const mockSavedMessage = {
      id: 'msg-002',
      chatId: CHAT_ID,
      senderId: CLIENT_ID,
      content: 'Mensagem normal',
      fileIds: [],
      isSystemMessage: false,
      createdAt: new Date(),
    };

    mockChatRepository.findById.mockResolvedValue(mockChat as any);
    mockMessageRepository.create.mockResolvedValue(mockSavedMessage as any);

    const result = await service.sendMessage(
      CHAT_ID,
      CLIENT_ID,
      UserRole.CLIENT,
      'Mensagem normal',
    );

    expect(result).toEqual(mockSavedMessage);
    expect(mockMessageRepository.create).toHaveBeenCalledWith({
      chatId: CHAT_ID,
      senderId: CLIENT_ID,
      content: 'Mensagem normal',
      isSystemMessage: false,
      fileIds: [],
      attachmentUrl: undefined,
      type: 'TEXT',
    });
  });

  it('should throw NotFoundException when chat does not exist', async () => {
    mockChatRepository.findById.mockResolvedValue(null);

    await expect(
      service.sendMessage(
        'invalid-chat',
        CLIENT_ID,
        UserRole.CLIENT,
        'Teste',
        ['file-001'],
      )
    ).rejects.toThrow(NotFoundException);
  });
});