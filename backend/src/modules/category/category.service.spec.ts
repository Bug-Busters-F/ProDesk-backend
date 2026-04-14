import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { CategoryService } from './category.service';
import { CategorySchema } from './category.schema';

describe('CategoryService (Integration)', () => {
  let service: CategoryService;
  let connection: Connection;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: 'Category', schema: CategorySchema },
        ]),
      ],
      providers: [CategoryService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
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

  it('should create a category successfully', async () => {
    const category = await service.createCategory(
      'IoT',
      ['sensor', 'dispositivo', 'iot', 'equipamento', 'hardware'],
      [
        'dispositivo desconectado',
        'erro no equipamento',
        'falha na comunicação com dispositivo',
      ],
    );

    expect(category).toBeDefined();
    expect(category.name).toBe('IoT');
    expect(category.keywords).toStrictEqual([
      'sensor',
      'dispositivo',
      'iot',
      'equipamento',
      'hardware',
    ]);
    expect(category.trainingPhrases).toStrictEqual([
      'dispositivo desconectado',
      'erro no equipamento',
      'falha na comunicação com dispositivo',
    ]);
  });

  it('should return all categories', async () => {
    await service.createCategory('C1');
    await service.createCategory('C2');

    const categories = await service.findAll();

    expect(categories.length).toBe(2);
  });

  it('should find category by id', async () => {
    const created = await service.createCategory('Test Category');

    const found = await service.findById(created.id.toString());

    expect(found).toBeDefined();
    expect(found.name).toBe('Test Category');
  });

  it('should find category by name', async () => {
    const created = await service.createCategory('Test Name');

    const found = await service.findByName(created.name);

    expect(found).toBeDefined();
    expect(found.name).toBe('Test Name');
  });

  it('should throw error when category is not found', async () => {
    await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
      'Category not found',
    );
  });

  it('should update category', async () => {
    const created = await service.createCategory('Old Name');

    const updated = await service.updateCategory(created.id.toString(), {
      name: 'New Name',
    });

    expect(updated.name).toBe('New Name');
  });

  it('should throw error when updating non-existent category', async () => {
    await expect(
      service.updateCategory('507f1f77bcf86cd799439011', {
        name: 'Fail',
      }),
    ).rejects.toThrow('Category not found');
  });

  it('should delete a category', async () => {
    const created = await service.createCategory('To Delete');

    await service.deleteCategory(created.id.toString());

    await expect(service.findById(created.id.toString())).rejects.toThrow();
  });

  it('should throw error when deleting non-existent category', async () => {
    await expect(
      service.deleteCategory('507f1f77bcf86cd799439011'),
    ).rejects.toThrow('Category not found');
  });
});