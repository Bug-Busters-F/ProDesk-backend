import { Injectable } from '@nestjs/common';
import { FileEntity } from '../../domain/file.entity';

@Injectable()
export class LocalStorage {

  save(file: Express.Multer.File): FileEntity {
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedAt: new Date()
    };
  }
}