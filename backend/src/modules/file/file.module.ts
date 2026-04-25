import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './presentation/file.controller';
import { FileService } from './application/file.service';
import { FileSchema } from './infra/schemas/file.schema';
import { LocalStorage } from './infra/storage/local.storage';
import { UserSchema } from '../user/user.schema';
import { CompanySchema } from '../company/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'File',
        schema: FileSchema
      },
      { name: 'User', 
        schema: UserSchema 
      },
      { 
        name: 'Company', 
        schema: CompanySchema
      },
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