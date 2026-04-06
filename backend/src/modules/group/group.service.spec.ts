import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { GroupService } from './group.service';
import { GroupSchema } from './group.schema';

describe('GroupService (Integration)', () => {
  let service: GroupService;
  let connection: Connection;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: 'Group', schema: GroupSchema }]),
      ],
      providers: [GroupService],
    }).compile();

    service = module.get<GroupService>(GroupService);
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

  it('should create a group successfully', async () => {
    const group = await service.createGroup('Support', 'Support team');

    expect(group).toBeDefined();
    expect(group.name).toBe('Support');
    expect(group.description).toBe('Support team');
  });

  it('should return all groups', async () => {
    await service.createGroup('G1');
    await service.createGroup('G2');

    const groups = await service.findAll();

    expect(groups.length).toBe(2);
  });

  it('should find group by id', async () => {
    const created = await service.createGroup('Test Group');

    const found = await service.findById(created.id.toString());

    expect(found).toBeDefined();
    expect(found.name).toBe('Test Group');
  });

  it('should throw error when group not found', async () => {
    await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
      'Group not found',
    );
  });

  it('should update group', async () => {
    const created = await service.createGroup('Old Name');

    const updated = await service.updateGroup(created.id.toString(), {
      name: 'New Name',
    });

    expect(updated.name).toBe('New Name');
  });

  it('should throw error when updating non-existent group', async () => {
    await expect(
      service.updateGroup('507f1f77bcf86cd799439011', {
        name: 'Fail',
      }),
    ).rejects.toThrow('Group not found');
  });

  it('should delete group', async () => {
    const created = await service.createGroup('To Delete');

    await service.deleteGroup(created.id.toString());

    await expect(service.findById(created.id.toString())).rejects.toThrow();
  });

  it('should throw error when deleting non-existent group', async () => {
    await expect(
      service.deleteGroup('507f1f77bcf86cd799439011'),
    ).rejects.toThrow('Group not found');
  });
});
