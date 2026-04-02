import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { CompanyService } from './company.service';
import { CompanySchema } from './company.schema';

describe('CompanyService (Integration)', () => {
  let service: CompanyService;
  let connection: Connection;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: 'Company', schema: CompanySchema },
        ]),
      ],
      providers: [CompanyService],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
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

  it('should create a company successfully', async () => {
    const company = await service.createCompany(
      'Pro4Tech',
      '12345678901234'
    );

    expect(company).toBeDefined();
    expect(company.name).toBe('Pro4Tech');
    expect(company.cnpj).toBe('12345678901234');
  });

  it('should find company by id', async () => {
    const created = await service.createCompany(
      'Test Company',
      '11111111111111'
    );

    const found = await service.findById(created.id);

    expect(found).toBeDefined();
    expect(found.name).toBe('Test Company');
  });

  it('should throw error when company not found by id', async () => {
    await expect(
      service.findById('507f1f77bcf86cd799439011')
    ).rejects.toThrow('Company not found');
  });

  it('should find company by cnpj', async () => {
    await service.createCompany(
      'Company CNPJ',
      '22222222222222'
    );

    const found = await service.findByCnpj('22222222222222');

    expect(found).toBeDefined();
    expect(found.name).toBe('Company CNPJ');
  });

  it('should throw error when company not found by cnpj', async () => {
    await expect(
      service.findByCnpj('00000000000000')
    ).rejects.toThrow('Company not found');
  });

  it('should return all companies', async () => {
    await service.createCompany('C1', '33333333333333');
    await service.createCompany('C2', '44444444444444');

    const companies = await service.findAll();

    expect(companies.length).toBe(2);
  });

  it('should update company', async () => {
    const created = await service.createCompany(
      'Old Name',
      '55555555555555'
    );

    const updated = await service.updateCompany(created.id, {
      name: 'New Name',
    });

    expect(updated.name).toBe('New Name');
  });

  it('should throw error when updating non-existent company', async () => {
    await expect(
      service.updateCompany('507f1f77bcf86cd799439011', {
        name: 'Fail',
      })
    ).rejects.toThrow('Company not found');
  });

  it('should delete company', async () => {
    const created = await service.createCompany(
      'To Delete',
      '66666666666666'
    );

    await service.deleteCompany(created.id);

    await expect(
      service.findById(created.id)
    ).rejects.toThrow();
  });

  it('should throw error when deleting non-existent company', async () => {
    await expect(
      service.deleteCompany('507f1f77bcf86cd799439011')
    ).rejects.toThrow('Company not found');
  });
});