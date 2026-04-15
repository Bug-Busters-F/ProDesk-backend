import { Injectable } from '@nestjs/common';
import { LocalStorage } from '../infra/storage/local.storage';
import { FileEntity } from '../domain/file.entity';

@Injectable()
export class FileService {
  constructor(
    private readonly storage: LocalStorage
  ) {}
  
  upload(
    file: Express.Multer.File
  ): FileEntity {
    return this.storage.save(file);
  }
}