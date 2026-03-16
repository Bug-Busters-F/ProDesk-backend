import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConnectionService } from './database.connection.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/prodesk'),
  ],
  providers: [DatabaseConnectionService],
})
export class DatabaseModule {}