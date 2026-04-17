import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.decorator';
import { UserRole } from '../../user/user.schema';
import { FileService } from '../application/file.service';
import { UploadFileDTO } from './dtos/uploadFileDTO';
import { multerConfig } from '../config/multer.config';
import type { Express, Request } from 'express';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(
    private fileService: FileService
  ) {}

  @Post()
  @UseGuards( JwtGuard, RolesGuard )
  @Roles( UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT )
  @ApiOperation({ summary: 'Upload de arquivo' })
  @ApiConsumes( 'multipart/form-data' )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerConfig
    )
  )
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    dto: UploadFileDTO,
    @Req()
    req: Request & {
      user: { id: string }
    }
  ) {
    const userId =
      req.user.id;
    return this.fileService.createFile(
      file,
      userId
    );
  }
}