import { Injectable } from '@nestjs/common';
import { FileEntity } from '../../domain/file.entity';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs';


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
    const newPath = join(uploadPath, file.filename);

    renameSync(file.path, newPath);

    return {
      id: undefined,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: newPath,
      uploadedBy,
      createdAt: new Date()
    };
  }

delete(filePath: string): void {
    try {
      const normalizedPath = filePath.replace(/^https?:\/\/.*?\//, '');

      if (fs.existsSync(normalizedPath)) {
        fs.unlinkSync(normalizedPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}