import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res
} from '@nestjs/common';

import { FileInterceptor }
from '@nestjs/platform-express';

import { multerConfig }
from '../config/multer.config';

import { FileService }
from '../application/file.service';

import type { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('files')
export class FileController {

  constructor(
    private readonly fileService: FileService
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerConfig
    )
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.fileService.upload(file);
  }

  @Get(':filename')
  getFile(
    @Param('filename')
    filename: string,

    @Res()
    res: Response
  ) {

    const stream =
      createReadStream(
        `uploads/${filename}`
      );
    stream.pipe(res);
  }
}