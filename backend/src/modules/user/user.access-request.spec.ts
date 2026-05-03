import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { AccessRequestSchema } from './accessRequest.schema';
import { CompanyService } from '../company/company.service';
import { CategoryService } from '../category/category.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { CompanySchema } from '../company/company.schema';
import { CategorySchema } from '../category/category.schema';

describe('AccessRequest (Integration)', () => {
  let service: UserService;
  let connection: Connection;
  let mongod: MongoMemoryServer;

  const companyId = new Types.ObjectId();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'AccessRequest', schema: AccessRequestSchema },
          { name: 'Company', schema: CompanySchema },
          { name: 'Category', schema: CategorySchema },
        ]),
      ],
      providers: [
        UserService,
        {
          provide: CompanyService,
          useValue: {
            findByCnpj: jest.fn().mockResolvedValue({
              _id: companyId,
              id: companyId.toString(),
              name: 'Empresa Teste',
              cnpj: '123',
            }),
            findById: jest.fn().mockResolvedValue({
              _id: companyId,
              id: companyId.toString(),
              name: 'Empresa Teste',
              cnpj: '123',
            }),
          },
        },

        {
          provide: CategoryService,
          useValue: {},
        },

        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fake-token'),
          },
        },

        {
          provide: EmailService,
          useValue: {
            sendCreatePasswordEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await connection.close();
    await mongod.stop();
  });

  it('should create access request', async () => {
    const result = await service.requestAccess(
      'Humberto',
      'humberto@email.com',
      '123',
    );

    expect(result).toEqual({
      message: 'Solicitação enviada com sucesso',
    });
  });

  it('should not allow duplicate request', async () => {
    await service.requestAccess(
      'Humberto',
      'humberto@email.com',
      '123',
    );

    await expect(
      service.requestAccess(
        'Humberto',
        'humberto@email.com',
        '123',
      ),
    ).rejects.toThrow();
  });

  it('should approve request and create user', async () => {
    await service.requestAccess(
      'Humberto',
      'humberto@email.com',
      '123',
    );

    const requests = await connection
      .collection('accessrequests')
      .find()
      .toArray();

    const approved = await service.approveRequest(
      requests[0]._id.toString(),
    );

    expect(approved).toBeDefined();
    expect(approved.email).toBe('humberto@email.com');
  });

  it('should reject request', async () => {
    await service.requestAccess(
      'Humberto',
      'humberto@email.com',
      '123',
    );

    const requests = await connection
      .collection('accessrequests')
      .find()
      .toArray();

    const result = await service.rejectRequest(
      requests[0]._id.toString(),
    );

    expect(result).toEqual({
      message: 'Solicitação rejeitada',
    });
  });
});