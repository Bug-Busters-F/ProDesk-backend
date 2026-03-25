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
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../entities/tickect.entity';
import { randomUUID } from 'crypto';

describe('ITicketRepository', () => {
  let moduleRef: TestingModule;
  let repository: ITicketRepository;
  let connection: Connection;

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
          {
            name: TicketSchemaClass.name,
            schema: TicketSchema,
          },
        ]),
      ],
      providers: [
        { provide: ITicketRepository, useClass: TicketMongoRepository },
      ],
    }).compile();

    repository = moduleRef.get<ITicketRepository>(ITicketRepository);
    connection = moduleRef.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    const collections = connection.collections;
    await collections['tickets'].deleteMany({});
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('Should Create a ticket successfull', async () => {
    const ticketToCreate = Ticket.create({
      title: 'chamado 1',
      category: TicketCategory.IA,
      priority: TicketPriority.MEDIUM,
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
    expect(primitiveResult.agentId).toBeNull();
    expect(primitiveResult.groupId).toBeNull();
    expect(primitiveResult.clientId).toBe(ticketToCreate.clientId);
  });

  it('Should read all successfull', async () => {
    const ticketToCreate = Ticket.create({
      title: 'chamado 2',
      category: TicketCategory.BI,
      priority: TicketPriority.LOW,
      description: 'descricao do chamado 2',
      clientId: randomUUID(),
    });

    await repository.create(ticketToCreate);

    const resultReadAll = await repository.readAll();

    expect(resultReadAll).toBeDefined();
    expect(Array.isArray(resultReadAll)).toBe(true);
    expect(resultReadAll.length).toBeGreaterThanOrEqual(0);

    resultReadAll.map((t) => expect(t).toBeInstanceOf(Ticket));
  });

  it('Should read a ticket by id successfull', async () => {
    const ticketToCreate = Ticket.create({
      title: 'chamado 3',
      category: TicketCategory.BI,
      priority: TicketPriority.LOW,
      description: 'descricao do chamado 3',
      clientId: randomUUID(),
    });

    await repository.create(ticketToCreate);

    const resultById = await repository.readById(ticketToCreate.id);

    expect(resultById).toBeDefined();
    expect(resultById).toBeInstanceOf(Ticket);

    const primitiveResult = resultById?.toPrimitives();

    expect(primitiveResult?.title).toBe('chamado 3');
    expect(primitiveResult?.category).toBe(TicketCategory.BI);
    expect(primitiveResult?.priority).toBe(TicketPriority.LOW);
    expect(primitiveResult?.description).toBe('descricao do chamado 3');
  });

  it('Should Save a ticket successfull', async () => {});

  it('Should delete a ticket by id successfull', async () => {
    const ticketToCreate = Ticket.create({
      title: 'chamado 5',
      category: TicketCategory.BI,
      priority: TicketPriority.LOW,
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
});
