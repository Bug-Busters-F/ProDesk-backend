import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './presentation/file.controller';
import { FileService } from './application/file.service';
import { FileSchema } from './infra/schemas/file.schema';
import { LocalStorage } from './infra/storage/local.storage';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'File',
        schema: FileSchema
      }
    ])
  ],
  controllers: [
    FileController
  ],
  providers: [
    FileService,
    LocalStorage
  ],
  exports: [
    FileService
  ]
})
export class FileModule {}