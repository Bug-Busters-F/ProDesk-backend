import { Test, TestingModule } from '@nestjs/testing';

import { getModelToken }
  from '@nestjs/mongoose';

import { EventEmitter2 }
  from '@nestjs/event-emitter';

import { ChatService }
  from './chat.service';

import { TicketSchemaClass }
  from '../../ticket/infra/schemas/ticket.mongo.schema';

import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import {
  ChatDetails,
  ChatStatus,
} from '../domain/chat.entity';

import { IChatRepository }
  from '../domain/chat.repository';

import { IMessageRepository }
  from '../../Messages/domain/message.repository';

import { UserRole }
  from '../../shared/enums/user.enum';

import {
  User,
} from '../../user/user.schema';

const mockChatRepository:
  jest.Mocked<IChatRepository> = {

  create: jest.fn(),

  findById: jest.fn(),

  findByParticipant: jest.fn(),

  findByTicketId: jest.fn(),

  updateStatus: jest.fn(),

  updateAgent: jest.fn(),
};

const mockMessageRepository:
  jest.Mocked<IMessageRepository> = {

  create: jest.fn(),

  findByChatId: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const TICKET_ID =
  '507f1f77bcf86cd799439011';

const CLIENT_ID =
  '507f1f77bcf86cd799439022';

const AGENT_ID =
  '507f1f77bcf86cd799439033';

const GROUP_ID =
  '507f1f77bcf86cd799439034';

const OUTSIDER_ID =
  '507f1f77bcf86cd799439044';

const CHAT_ID =
  '507f1f77bcf86cd799439055';

const mockChat: ChatDetails = {
  id: CHAT_ID,

  ticketId: TICKET_ID,

  clientId: CLIENT_ID,

  agentId: AGENT_ID,

  groupId: GROUP_ID,

  status: ChatStatus.OPEN,

  createdAt:
    new Date('2026-01-01'),
};

describe('ChatService', () => {

  let service: ChatService;

  beforeEach(async () => {

    const module: TestingModule =
      await Test.createTestingModule({

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

          {
            provide:
              getModelToken(
                TicketSchemaClass.name,
              ),

            useValue: {},
          },

          {
            provide:
              getModelToken(
                User.name,
              ),

            useValue: {},
          },

          {
            provide: EventEmitter2,

            useValue: mockEventEmitter,
          },
        ],
      }).compile();

    service =
      module.get<ChatService>(
        ChatService,
      );

    jest.clearAllMocks();
  });

  it('should be defined', () => {

    expect(service)
      .toBeDefined();
  });

  describe('createChat', () => {

    it(
      'should create a chat and return its details',
      async () => {

        mockChatRepository.create
          .mockResolvedValue(mockChat);

        const result =
          await service.createChat(
            TICKET_ID,
            CLIENT_ID,
            AGENT_ID,
            GROUP_ID,
          );

        expect(result)
          .toEqual(mockChat);

        expect(
          mockChatRepository.create,
        ).toHaveBeenCalledWith({

          ticketId: TICKET_ID,

          clientId: CLIENT_ID,

          agentId: AGENT_ID,

          groupId: GROUP_ID,
        });

        expect(
          mockChatRepository.create,
        ).toHaveBeenCalledTimes(1);
      },
    );
  });

  describe('getChatById', () => {

    it(
      'should return chat details when chat exists',
      async () => {

        mockChatRepository.findById
          .mockResolvedValue(mockChat);

        const result =
          await service.getChatById(
            CHAT_ID,
          );

        expect(result)
          .toEqual(mockChat);

        expect(
          mockChatRepository.findById,
        ).toHaveBeenCalledWith(
          CHAT_ID,
        );
      },
    );

    it(
      'should throw NotFoundException when chat does not exist',
      async () => {

        mockChatRepository.findById
          .mockResolvedValue(null);

        await expect(
          service.getChatById(
            'nonexistent',
          ),
        ).rejects.toThrow(
          NotFoundException,
        );
      },
    );
  });

  describe('isParticipant', () => {

    it(
      'should return true when userId is the clientId',
      async () => {

        mockChatRepository.findById
          .mockResolvedValue(mockChat);

        const result =
          await service.isParticipant(
            CHAT_ID,
            CLIENT_ID,
          );

        expect(result)
          .toBe(true);
      },
    );

    it(
      'should return true when userId is the agentId',
      async () => {

        mockChatRepository.findById
          .mockResolvedValue(mockChat);

        const result =
          await service.isParticipant(
            CHAT_ID,
            AGENT_ID,
          );

        expect(result)
          .toBe(true);
      },
    );

    it(
      'should return false when userId is not a participant',
      async () => {

        mockChatRepository.findById
          .mockResolvedValue(mockChat);

        const result =
          await service.isParticipant(
            CHAT_ID,
            OUTSIDER_ID,
          );

        expect(result)
          .toBe(false);
      },
    );

    it(
      'should return false when chat does not exist',
      async () => {

        mockChatRepository.findById
          .mockResolvedValue(null);

        const result =
          await service.isParticipant(
            'nonexistent',
            CLIENT_ID,
          );

        expect(result)
          .toBe(false);
      },
    );
  });
});