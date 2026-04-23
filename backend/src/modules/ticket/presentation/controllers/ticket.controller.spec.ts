/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketUseCase } from '../../application/useCases/create/create.usecase';
import { EscalateTicketUseCase } from '../../application/useCases/escalate/escalate.usecase';
import { GetHistoryTicketUseCase } from '../../application/useCases/getHistory/getHistory.usecase';
import { NewAgentTicketUseCase } from '../../application/useCases/newAgent/newAgent.usecase';
import { ReadAllTicketUseCase } from '../../application/useCases/readAll/readAll.usecase';
import { ReadByIdTicketUseCase } from '../../application/useCases/readById/readById.usecase';
import { TicketController } from './ticket.controller';
import { DeleteTicketUseCase } from '../../application/useCases/delete/delete.usecase';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Ticket, TicketStatus } from '../../domain/entities/ticket.entity';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';

describe('TicketController', () => {
  let app: INestApplication;
  let httpServer: import('http').Server;

  let createUseCase: CreateTicketUseCase;
  let readAllUseCase: ReadAllTicketUseCase;
  let readByIdUseCase: ReadByIdTicketUseCase;
  let getHistoryUseCase: GetHistoryTicketUseCase;
  let newAgentUseCase: NewAgentTicketUseCase;
  let escalateTicketUseCase: EscalateTicketUseCase;
  let deleteUseCase: DeleteTicketUseCase;

  const ticketData = {
    title: 'chamado 1',
    category: 'bi',
    description: 'descricao do chamado 1',
    clientId: randomUUID(),
  };
  const ticket = Ticket.create(ticketData);

  beforeAll(async () => {
    const modulesFixture: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: CreateTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ReadAllTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ReadByIdTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetHistoryTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: EscalateTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: NewAgentTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteTicketUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = modulesFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as import('http').Server;

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    createUseCase = modulesFixture.get(CreateTicketUseCase);
    readAllUseCase = modulesFixture.get(ReadAllTicketUseCase);
    readByIdUseCase = modulesFixture.get(ReadByIdTicketUseCase);
    getHistoryUseCase = modulesFixture.get(GetHistoryTicketUseCase);
    newAgentUseCase = modulesFixture.get(NewAgentTicketUseCase);
    escalateTicketUseCase = modulesFixture.get(EscalateTicketUseCase);
    deleteUseCase = modulesFixture.get(DeleteTicketUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /tickets should create and return a ticket', async () => {
    const primitives = ticket.toPrimitives();

    jest.spyOn(createUseCase, 'execute').mockResolvedValue({
      _id: primitives._id,
      title: primitives.title,
      category: primitives.category,
      description: primitives.description,
      clientId: primitives.clientId,
      fileUrls: primitives.fileUrls,
      status: primitives.status,
      createdAt: primitives.createdAt,
    });

    const response = await request(httpServer)
      .post('/tickets')
      .send(ticketData)
      .expect(201);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: primitives._id,
        title: primitives.title,
        category: primitives.category,
        description: primitives.description,
        clientId: primitives.clientId,
        fileUrls: primitives.fileUrls,
        status: primitives.status,
      }),
    );

    expect(createUseCase.execute).toHaveBeenCalledTimes(1);
    // expect(createUseCase.execute).toHaveBeenCalledWith();
  });

  it('GET /tickets should return a array of all tickets', async () => {
    const primitives = ticket.toPrimitives();

    jest.spyOn(readAllUseCase, 'execute').mockResolvedValue([
      {
        id: primitives._id,
        title: primitives.title,
        category: primitives.category,
        priority: primitives.priority,
        description: primitives.description,
        clientId: primitives.clientId,
        status: primitives.status,
        createdAt: primitives.createdAt,
        agentId: null,
        groupId: null,
        escalationLevel: 0,
        updatedAt: null,
        closedAt: null,
      },
    ]);

    const response = await request(httpServer).get('/tickets').expect(200);

    expect(response.body[0]).toBeInstanceOf(Object);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: primitives._id,
        title: primitives.title,
        category: primitives.category,
        priority: primitives.priority,
        description: primitives.description,
        clientId: primitives.clientId,
        status: primitives.status,
        agentId: null,
        groupId: null,
        escalationLevel: 0,
        updatedAt: null,
        closedAt: null,
      }),
    );

    expect(readAllUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('GET /tickets/:id should return a ticket by id', async () => {
    const primitives = ticket.toPrimitives();
    jest.spyOn(readByIdUseCase, 'execute').mockResolvedValue({
      id: primitives._id,
      title: primitives.title,
      category: primitives.category,
      priority: primitives.priority,
      description: primitives.description,
      clientId: primitives.clientId,
      status: primitives.status,
      createdAt: primitives.createdAt,
      agentId: null,
      groupId: null,
      escalationLevel: 0,
      updatedAt: null,
      closedAt: null,
    });

    const response = await request(httpServer)
      .get(`/tickets/${ticket.id}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: primitives._id,
        title: primitives.title,
        category: primitives.category,
        priority: primitives.priority,
        description: primitives.description,
        clientId: primitives.clientId,
        status: primitives.status,
        agentId: null,
        groupId: null,
        escalationLevel: 0,
        updatedAt: null,
        closedAt: null,
      }),
    );

    expect(readByIdUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('GET /tickets/:id/history should return a ticket history by id', async () => {
    jest.spyOn(getHistoryUseCase, 'execute').mockResolvedValue({
      id: ticket.id,
      history: [...ticket.history],
    });

    const response = await request(httpServer)
      .get(`/tickets/${ticket.id}/history`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: ticket.id,
        history: ticket.history.map((entry) => ({
          ...entry,
          occurredAt: entry.occurredAt.toISOString(),
        })),
      }),
    );

    expect(getHistoryUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('PUT /tickets/:id/assignAgent should assign a agent to a ticket and return updated', async () => {
    const agentId = randomUUID();

    ticket.assignToAgent(agentId);

    const primitives = ticket.toPrimitives();

    jest.spyOn(newAgentUseCase, 'execute').mockResolvedValue({
      id: primitives._id,
      agentId: primitives.agentId,
      status: primitives.status,
    });

    const payload = {
      groupUD: randomUUID(),
      category: 'iot',
    };

    const response = await request(httpServer)
      .put(`/tickets/${ticket.id}/assignAgent`)
      .send(payload)
      .expect(200);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: primitives._id,
        agentId: agentId,
        status: TicketStatus.IN_PROGRESS,
      }),
    );

    expect(newAgentUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('PUT /tickets/:id/escalate should escalate to a ticket and return updated', async () => {
    const agentId = randomUUID();
    const groupId = randomUUID();

    ticket.assignToAgent(agentId);
    ticket.escalate(groupId, 'iot');

    const primitives = ticket.toPrimitives();

    jest.spyOn(escalateTicketUseCase, 'execute').mockResolvedValue({
      id: primitives._id,
      title: primitives.title,
      category: primitives.category,
      priority: primitives.priority,
      description: primitives.category,
      clientId: ticket.clientId,
      status: primitives.status,
      agentId: agentId,
      groupId: groupId,
      escalationLevel: primitives.escalationLevel,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });

    const payload = {
      groupUD: randomUUID(),
      category: 'iot',
    };

    const response = await request(httpServer)
      .put(`/tickets/${ticket.id}/escalate`)
      .send(payload)
      .expect(200);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: primitives._id,
        title: primitives.title,
        category: primitives.category,
        priority: primitives.priority,
        description: primitives.category,
        clientId: ticket.clientId,
        status: primitives.status,
        agentId: agentId,
        groupId: groupId,
        escalationLevel: 2,
        updatedAt: primitives.updatedAt?.toISOString(),
      }),
    );

    expect(escalateTicketUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('DELETE /tickets/:id/ should delete a ticket and return a boolean', async () => {
    jest.spyOn(deleteUseCase, 'execute').mockResolvedValue(true);

    const response = await request(httpServer)
      .delete(`/tickets/${ticket.id}`)
      .expect(200);

    expect(response.body.deleted).toBe(true);

    expect(deleteUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
