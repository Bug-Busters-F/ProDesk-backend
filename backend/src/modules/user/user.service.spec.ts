import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';

import { UserService } from './user.service';
import { UserSchema, UserRole } from './user.schema';
import { GroupService } from '../group/group.service';
import { CompanyService } from '../company/company.service';
import { CompanySchema } from '../company/company.schema';
import { GroupSchema } from '../group/group.schema';

describe('UserService (Integration)', () => {
  let service: UserService;
  let connection: Connection;
  let mongod: MongoMemoryServer;

  const mockCompanyService = {
    findById: jest.fn().mockResolvedValue({
      id: 'company123',
      name: 'Test Company',
      cnpj: '12345678901234',
    }),
  };

  const mockGroupService = {
    findById: jest.fn().mockResolvedValue({
      id: 'group123',
      name: 'Test Group',
      description: 'Test desc',
    }),
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'Company', schema: CompanySchema },
          { name: 'Group', schema: GroupSchema },
        ]),
      ],
      providers: [
        UserService,
        {
          provide: CompanyService,
          useValue: {
            findById: jest.fn().mockResolvedValue({
              id: 'company-id',
              name: 'Test Company',
              cnpj: '123',
            }),
          },
        },

        {
          provide: GroupService,
          useValue: {
            findById: jest.fn().mockResolvedValue({
              id: 'group-id',
              name: 'Test Group',
              description: 'desc',
            }),
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

  it('should create user successfully', async () => {
    const companyId = new Types.ObjectId();
    const groupId = new Types.ObjectId();

    await connection.collection('companies').insertOne({
      _id: companyId,
      name: 'Test Company',
      cnpj: '12345678901234',
    });

    await connection.collection('groups').insertOne({
      _id: groupId,
      name: 'Test Group',
      description: 'Test desc',
    });

    const user = await service.createUser(
      'Gabriel',
      'gabriel@email.com',
      'Password123!',
      UserRole.ADMIN,
      companyId.toString(),
      groupId.toString(),
    );

    expect(user).toBeDefined();
    expect(user.email).toBe('gabriel@email.com');
  });

  it('should find user by id', async () => {
    const created = await service.createUser(
      'Test',
      'test@email.com',
      'Password123!',
      UserRole.CLIENT,
    );

    const result = await service.findById(created._id.toString());

    expect(result).toBeDefined();
    expect(result.email).toBe('test@email.com');
  });

  it('should return paginated users', async () => {
    await service.createUser(
      'User1',
      'u1@email.com',
      'Password123!',
      UserRole.CLIENT,
    );
    await service.createUser(
      'User2',
      'u2@email.com',
      'Password123!',
      UserRole.CLIENT,
    );

    const result = await service.findAll(1, 1);

    expect(result.data.length).toBe(1);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.lastPage).toBe(2);
  });

  it('should filter users by name', async () => {
    await service.createUser(
      'Gabriel',
      'g@email.com',
      'Password123!',
      UserRole.CLIENT,
    );
    await service.createUser(
      'Maria',
      'm@email.com',
      'Password123!',
      UserRole.CLIENT,
    );

    const result = await service.findAll(1, 10, { name: 'gab' });

    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toBe('Gabriel');
  });

  it('should update user', async () => {
    const created = await service.createUser(
      'Old Name',
      'old@email.com',
      'Password123!',
      UserRole.CLIENT,
    );

    const updated = await service.updateUser(created._id.toString(), {
      name: 'New Name',
    });

    expect(updated.name).toBe('New Name');
  });

  it('should delete user', async () => {
    const created = await service.createUser(
      'To Delete',
      'delete@email.com',
      'Password123!',
      UserRole.CLIENT,
    );

    await service.deleteUser(created._id.toString());

    await expect(service.findById(created._id.toString())).rejects.toThrow();
  });

  it('should throw error when email already exists on update', async () => {
    await service.createUser(
      'User1',
      'same@email.com',
      'Password123!',
      UserRole.CLIENT,
    );

    const user2 = await service.createUser(
      'User2',
      'other@email.com',
      'Password123!',
      UserRole.CLIENT,
    );

    await expect(
      service.updateUser(user2._id.toString(), {
        email: 'same@email.com',
      }),
    ).rejects.toThrow();
  });
});
