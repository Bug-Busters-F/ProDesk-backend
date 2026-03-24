import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { DatabaseConnectionService } from '../../../database/database.connection.service';

describe('TicketMongoRepository', () => {
  beforeAll(() => {
    const moduleRef = Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            uri: config.get<string>('MONGO_URI'),
          }),
        }),
      ],
      providers: [DatabaseConnectionService],
    }).compile();
  });
});
