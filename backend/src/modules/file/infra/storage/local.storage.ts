import { Injectable } from '@nestjs/common';
import { FileEntity } from '../../domain/file.entity';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LocalStorage {

  save(
    file: Express.Multer.File,
    subFolder: string,
    uploadedBy?: string
  ): FileEntity {
    const uploadPath =
      join(
        'uploads',
        subFolder
      );
    if (!existsSync(uploadPath)) {
      mkdirSync(
        uploadPath,
        { recursive: true }
      );
    }
    const newPath =
      join(
        uploadPath, file.filename
      );
    renameSync(
      file.path, newPath
    );
    return {
      id: undefined,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy,
      createdAt: new Date()
    };
  }
}