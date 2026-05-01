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
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import {
  Ticket,
  TicketStatus,
  TicketEvents,
} from '../../domain/entities/ticket.entity';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../shared/enums/user.enum';
import { GetHistoryFilteredUseCase } from '../../application/useCases/getHistoryFiltered/getHistoryFiltered.usecase';
import { CloseTicketUseCase } from '../../application/useCases/close/close.usecase';

describe('TicketController', () => {
  let app: INestApplication;
  let httpServer: import('http').Server;

  let createUseCase: CreateTicketUseCase;
  let readAllUseCase: ReadAllTicketUseCase;
  let readByIdUseCase: ReadByIdTicketUseCase;
  let getHistoryUseCase: GetHistoryTicketUseCase;
  let getHistoryFilteredUseCase: GetHistoryFilteredUseCase;
  let newAgentUseCase: NewAgentTicketUseCase;
  let escalateTicketUseCase: EscalateTicketUseCase;
  let closeTicketUseCase: CloseTicketUseCase;
  let deleteUseCase: DeleteTicketUseCase;

  const ticketData = {
    title: 'chamado 1',
    category: randomUUID(),
    description: 'descricao do chamado 1',
    clientId: randomUUID(),
  };
  let ticket: Ticket;

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
          provide: CloseTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetHistoryFilteredUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetHistoryTicketUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: randomUUID(),
            role: UserRole.ADMIN,
            groupId: randomUUID(),
          };
          return true;
        },
      })
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
    getHistoryFilteredUseCase = modulesFixture.get(GetHistoryFilteredUseCase);
    newAgentUseCase = modulesFixture.get(NewAgentTicketUseCase);
    escalateTicketUseCase = modulesFixture.get(EscalateTicketUseCase);
    closeTicketUseCase = modulesFixture.get(CloseTicketUseCase);
    deleteUseCase = modulesFixture.get(DeleteTicketUseCase);
  });

  beforeEach(() => {
    ticket = Ticket.create(ticketData);

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
      level: primitives.escalationLevel,
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
        level: primitives.escalationLevel,
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
      agentId: null,
      escalationLevel: 1,
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
        agentId: null,
        escalationLevel: 1,
        updatedAt: primitives.updatedAt?.toISOString(),
      }),
    );

    expect(escalateTicketUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('PUT /tickets/:id/close should close a ticket and return updated', async () => {
    const agentId = randomUUID();

    // precisa estar IN_PROGRESS antes de fechar
    ticket.assignToAgent(agentId);

    const primitives = ticket.toPrimitives();

    // simula fechamento
    ticket.close('Servidor reiniciado');

    jest.spyOn(closeTicketUseCase, 'execute').mockResolvedValue({
      id: primitives._id,
      title: primitives.title,
      category: primitives.category,
      priority: primitives.priority,
      description: primitives.description,
      clientId: primitives.clientId,
      status: TicketStatus.CLOSED,
      agentId: agentId,
      escalationLevel: primitives.escalationLevel,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });

    const payload = {
      solution: 'Servidor reiniciado',
    };

    const response = await request(httpServer)
      .put(`/tickets/${ticket.id}/close`)
      .send(payload)
      .expect(200);

    expect(response.body).toBeInstanceOf(Object);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: primitives._id,
        status: TicketStatus.CLOSED,
        agentId: agentId,
      }),
    );

    expect(closeTicketUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('DELETE /tickets/:id/ should delete a ticket and return a boolean', async () => {
    jest.spyOn(deleteUseCase, 'execute').mockResolvedValue(true);

    const response = await request(httpServer)
      .delete(`/tickets/${ticket.id}`)
      .expect(200);

    expect(response.body.deleted).toBe(true);

    expect(deleteUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('GET /tickets/:id/history?status= should return filtered history by status', async () => {
    ticket.assignToAgent(randomUUID());

    const filteredHistory = ticket.history.filter(
      (e) => e.status === TicketStatus.IN_PROGRESS,
    );

    jest.spyOn(getHistoryFilteredUseCase, 'execute').mockResolvedValue({
      id: ticket.id,
      history: filteredHistory,
    });

    const response = await request(httpServer)
      .get(`/tickets/${ticket.id}/history?status=IN_PROGRESS`)
      .expect(200);

    expect(
      response.body.history.every((e) => e.status === TicketStatus.IN_PROGRESS),
    ).toBe(true);
    expect(getHistoryFilteredUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getHistoryFilteredUseCase.execute).toHaveBeenCalledWith(
      ticket.id,
      expect.objectContaining({ status: TicketStatus.IN_PROGRESS }),
    );
    expect(getHistoryUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /tickets/:id/history?event= should return filtered history by event', async () => {
    const filteredHistory = ticket.history.filter(
      (e) => e.event === TicketEvents.NEW_AGENT,
    );

    jest.spyOn(getHistoryFilteredUseCase, 'execute').mockResolvedValue({
      id: ticket.id,
      history: filteredHistory,
    });

    const response = await request(httpServer)
      .get(`/tickets/${ticket.id}/history?event=NEW_AGENT`)
      .expect(200);

    expect(
      response.body.history.every((e) => e.event === TicketEvents.NEW_AGENT),
    ).toBe(true);
    expect(getHistoryFilteredUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getHistoryUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /tickets/:id/history?responsibleAgent= should return filtered history by agent', async () => {
    const agentId = randomUUID();
    ticket.assignToAgent(agentId);

    const filteredHistory = ticket.history.filter(
      (e) => e.responsibleAgent === agentId,
    );

    jest.spyOn(getHistoryFilteredUseCase, 'execute').mockResolvedValue({
      id: ticket.id,
      history: filteredHistory,
    });

    const response = await request(httpServer)
      .get(`/tickets/${ticket.id}/history?responsibleAgent=${agentId}`)
      .expect(200);

    expect(
      response.body.history.every((e) => e.responsibleAgent === agentId),
    ).toBe(true);
    expect(getHistoryFilteredUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getHistoryUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /tickets/:id/history?fromDate= should return filtered history by date', async () => {
    const fromDate = new Date(Date.now() - 10000).toISOString();

    jest.spyOn(getHistoryFilteredUseCase, 'execute').mockResolvedValue({
      id: ticket.id,
      history: [...ticket.history],
    });

    const response = await request(httpServer)
      .get(`/tickets/${ticket.id}/history?fromDate=${fromDate}`)
      .expect(200);

    expect(Array.isArray(response.body.history)).toBe(true);
    expect(getHistoryFilteredUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getHistoryUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /tickets/:id/history with multiple filters should call filtered use case', async () => {
    const agentId = randomUUID();

    jest.spyOn(getHistoryFilteredUseCase, 'execute').mockResolvedValue({
      id: ticket.id,
      history: [],
    });

    await request(httpServer)
      .get(
        `/tickets/${ticket.id}/history?status=IN_PROGRESS&event=NEW_AGENT&responsibleAgent=${agentId}`,
      )
      .expect(200);

    expect(getHistoryFilteredUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getHistoryFilteredUseCase.execute).toHaveBeenCalledWith(
      ticket.id,
      expect.objectContaining({
        status: TicketStatus.IN_PROGRESS,
        event: TicketEvents.NEW_AGENT,
        responsibleAgent: agentId,
      }),
    );
    expect(getHistoryUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /tickets/:id/history without filters should call plain history use case', async () => {
    jest.spyOn(getHistoryUseCase, 'execute').mockResolvedValue({
      id: ticket.id,
      history: [...ticket.history],
    });

    await request(httpServer).get(`/tickets/${ticket.id}/history`).expect(200);

    expect(getHistoryUseCase.execute).toHaveBeenCalledTimes(1);
    expect(getHistoryFilteredUseCase.execute).not.toHaveBeenCalled();
  });

  it('GET /tickets should return tickets filtered by agentId when role is SUPPORT', async () => {
    const agentId = randomUUID();
    const categories = [randomUUID()];
    const primitives = ticket.toPrimitives();

    const moduleFixture = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        { provide: CreateTicketUseCase, useValue: { execute: jest.fn() } },
        { provide: ReadAllTicketUseCase, useValue: { execute: jest.fn() } },
        { provide: ReadByIdTicketUseCase, useValue: { execute: jest.fn() } },
        { provide: GetHistoryTicketUseCase, useValue: { execute: jest.fn() } },
        { provide: EscalateTicketUseCase, useValue: { execute: jest.fn() } },
        { provide: NewAgentTicketUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteTicketUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: agentId,
            role: UserRole.SUPPORT,
            categories: categories, // consistente com o JwtStrategy
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const isolatedApp = moduleFixture.createNestApplication();
    await isolatedApp.init();

    const localReadAllUseCase = moduleFixture.get(ReadAllTicketUseCase);

    jest.spyOn(localReadAllUseCase, 'execute').mockResolvedValue([
      {
        id: primitives._id,
        title: primitives.title,
        category: categories[0],
        priority: primitives.priority,
        description: primitives.description,
        clientId: primitives.clientId,
        status: primitives.status,
        createdAt: primitives.createdAt,
        agentId: agentId,
        escalationLevel: 1,
        updatedAt: null,
        closedAt: null,
      },
    ]);

    const response = await request(isolatedApp.getHttpServer())
      .get('/tickets')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toEqual(
      expect.objectContaining({ agentId, category: categories[0] }),
    );

    expect(localReadAllUseCase.execute).toHaveBeenCalledWith({
      userId: agentId,
      categories: categories,
      role: UserRole.SUPPORT,
    });

    await isolatedApp.close();
  });
});
