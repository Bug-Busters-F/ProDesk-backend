import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from '@jest/globals';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  TicketSchema,
  TicketSchemaClass,
} from '../../infra/schemas/ticket.mongo.schema';
import { ITicketRepository } from './ticket.repository.interface';
import { TicketMongoRepository } from '../../infra/repositories/ticket.mongodb.repository';
import { Connection } from 'mongoose';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../entities/ticket.entity';
import { randomUUID } from 'crypto';
import { User, UserSchema } from '../../../user/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from '../../../shared/enums/user.enum';

describe('ITicketRepository', () => {
  let moduleRef: TestingModule;
  let repository: ITicketRepository;
  let connection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            uri: config.get<string>('MONGO_URI'),
          }),
        }),
        MongooseModule.forFeature([
          { name: TicketSchemaClass.name, schema: TicketSchema },
          { name: User.name, schema: UserSchema },
        ]),
      ],
      providers: [
        { provide: ITicketRepository, useClass: TicketMongoRepository },
      ],
    }).compile();

    repository = moduleRef.get<ITicketRepository>(ITicketRepository);
    connection = moduleRef.get<Connection>(getConnectionToken());
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(async () => {
    const collections = connection.collections;
    await collections['tickets'].deleteMany({});
    await collections['users'].deleteMany({});
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('Should Create a ticket successfully', async () => {
    const ticketToCreate = Ticket.create({
      title: 'chamado 1',
      category: randomUUID(),
      description: 'descricao do chamado 1',
      clientId: randomUUID(),
    });

    const createResult = await repository.create(ticketToCreate);

    expect(createResult).toBeDefined();
    expect(createResult).toBeInstanceOf(Ticket);

    const primitiveResult = createResult.toPrimitives();

    expect(primitiveResult.status).toBe(TicketStatus.OPEN);
    expect(primitiveResult.escalationLevel).toBe(1);
    expect(ticketToCreate.id).toBe(createResult.id);
    expect(primitiveResult.groupId).toBeNull();
    expect(primitiveResult.clientId).toBe(ticketToCreate.clientId);
  });

  it('Should read all successfully', async () => {
    const ticketToCreate = Ticket.create({
      title: 'chamado 2',
      category: randomUUID(),
      description: 'descricao do chamado 2',
      clientId: randomUUID(),
    });

    await repository.create(ticketToCreate);

    const resultReadAll = await repository.readAll();

    expect(resultReadAll).toBeDefined();
    expect(Array.isArray(resultReadAll)).toBe(true);
    expect(resultReadAll.length).toBe(1);
    resultReadAll.map((t) => expect(t).toBeInstanceOf(Ticket));
  });

  it('Should read a ticket by id successfully', async () => {
    const categoryId = randomUUID();

    const ticketToCreate = Ticket.create({
      title: 'chamado 3',
      category: categoryId,
      description: 'descricao do chamado 3',
      clientId: randomUUID(),
    });

    await repository.create(ticketToCreate);

    const resultById = await repository.readById(ticketToCreate.id);

    expect(resultById).toBeDefined();
    expect(resultById).toBeInstanceOf(Ticket);

    const primitiveResult = resultById?.toPrimitives();

    expect(primitiveResult?.title).toBe('chamado 3');
    expect(primitiveResult?.category).toBe(categoryId);
    expect(primitiveResult?.priority).toBe(TicketPriority.LOW);
    expect(primitiveResult?.description).toBe('descricao do chamado 3');
  });

  it('Should return null when try to read a non-existent ticket by id', async () => {
    const result = await repository.readById(randomUUID());
    expect(result).toBeNull();
  });

  it('Should Save a ticket successfully', async () => {
    // cria o agente no banco com ObjectId gerado pelo mongo
    const createdUser = await userModel.create({
      name: 'João Silva',
      email: `agent_${randomUUID()}@test.com`,
      password: 'hashed_password',
      role: UserRole.AGENT,
    });

    const agentObjectId = createdUser._id.toString();

    const ticketToCreate = Ticket.create({
      title: 'chamado 5',
      category: randomUUID(),
      description: 'descricao do chamado 5',
      clientId: randomUUID(),
    });

    const ticket = await repository.create(ticketToCreate);

    expect(ticket.agentId).toBe(null);
    expect(ticket.status).toBe(TicketStatus.OPEN);

    ticket.assignToAgent(agentObjectId);

    const savedTicket = await repository.save(ticket);

    expect(savedTicket).toBeDefined();
    expect(savedTicket?.agent?.id).toBe(agentObjectId);
    expect(savedTicket?.agent?.name).toBe('João Silva');
    expect(savedTicket?.agent).toEqual({
      id: agentObjectId,
      name: 'João Silva',
    });
    expect(savedTicket?.status).toBe(TicketStatus.IN_PROGRESS);
  });

  it('Should return null when try to save a non-existent ticket', async () => {
    const ticket = Ticket.create({
      title: 'chamado 5',
      category: randomUUID(),
      description: 'descricao do chamado 5',
      clientId: randomUUID(),
    });

    ticket.assignToAgent(randomUUID());

    const savedTicket = await repository.save(ticket);

    expect(savedTicket).toBeNull();
  });

  it('Should delete a ticket by id successfully', async () => {
    const ticketToCreate = Ticket.create({
      title: 'chamado 5',
      category: randomUUID(),
      description: 'descricao do chamado 5',
      clientId: randomUUID(),
    });

    const createdTicket = await repository.create(ticketToCreate);

    expect(createdTicket).toBeDefined();

    const deleteResult = await repository.delete(createdTicket.id);

    expect(deleteResult).toBe(true);

    const foundedTicket = await repository.readById(createdTicket.id);

    expect(foundedTicket).toBeNull();
  });

  it('Should return false when try to delete a non-existent ticket', async () => {
    const deleteResult = await repository.delete(randomUUID());
    expect(deleteResult).toBe(false);
  });

  it('Should read all tickets by clientId successfully', async () => {
    const clientId = randomUUID();

    const ticket1 = Ticket.create({
      title: 'chamado 6',
      category: randomUUID(),
      description: 'descricao do chamado 6',
      clientId,
    });

    const ticket2 = Ticket.create({
      title: 'chamado 7',
      category: randomUUID(),
      description: 'descricao do chamado 7',
      clientId,
    });

    await repository.create(ticket1);
    await repository.create(ticket2);

    const resultReadAll = await repository.readAll({ clientId });
    expect(resultReadAll).toBeDefined();
    expect(Array.isArray(resultReadAll)).toBe(true);
    expect(resultReadAll.length).toBe(2);
    resultReadAll.map((t) => expect(t).toBeInstanceOf(Ticket));

    const resultReadAllWithAnotherClientId = await repository.readAll({
      clientId: randomUUID(),
    });
    expect(resultReadAllWithAnotherClientId).toBeDefined();
    expect(Array.isArray(resultReadAllWithAnotherClientId)).toBe(true);
    expect(resultReadAllWithAnotherClientId.length).toBe(0);
  });

  it('should read all tickets by agentId or unassigned tickets in the same group', async () => {
    const createdUser = await userModel.create({
      name: 'Agente Teste',
      email: `agent_${randomUUID()}@test.com`,
      password: 'hashed_password',
      role: UserRole.SUPPORT,
    });

    const agentId = createdUser._id.toString();
    const categoryId = randomUUID();

    const ticket1 = Ticket.create({
      title: 'chamado 1',
      category: categoryId,
      description: 'atribuído ao agente',
      clientId: randomUUID(),
    });
    ticket1.assignToAgent(agentId);

    const ticket2 = Ticket.create({
      title: 'chamado 2',
      category: categoryId,
      description: 'sem agente no grupo',
      clientId: randomUUID(),
    });

    const ticket3 = Ticket.create({
      title: 'chamado 3',
      category: categoryId,
      description: 'outro agente atribuído',
      clientId: randomUUID(),
    });
    ticket3.assignToAgent(randomUUID());

    await repository.create(ticket1);
    await repository.create(ticket2);
    await repository.create(ticket3);

    const result = await repository.readAll({
      agentId,
      categories: [categoryId],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    result.forEach((t) => expect(t).toBeInstanceOf(Ticket));

    const ids = result.map((t) => t.id);
    expect(ids).toContain(ticket1.id);
    expect(ids).toContain(ticket2.id);
    expect(ids).not.toContain(ticket3.id);
  });
});
