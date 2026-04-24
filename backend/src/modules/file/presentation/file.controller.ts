import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Body, Req, Param, Get, Res } from '@nestjs/common';
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
import { UploadChatFileParamsDTO } from './dtos/uploadChatFileParamsDTO';
import { profileMulterConfig } from '../config/profile-multer.config';
import type { Response } from 'express';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(
    private fileService: FileService
  ) { }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiOperation({ summary: 'Upload de arquivo' })
  @ApiConsumes('multipart/form-data')
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
    FileInterceptor('file', multerConfig)
  )
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    dto: UploadFileDTO,
    @Req()
    req: Request & { user: { id: string } }
  ) {
    const userId = req.user.id;
    return this.fileService.createFile(file, userId);
  }

  @Post('chat/:chatId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerConfig
    )
  )
  @ApiOperation({
    summary: 'Upload de arquivo para chat'
  })
  @ApiConsumes('multipart/form-data')
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
  async uploadChatFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Req()
    req: Request & { user: { id: string } },
    @Param()
    params: UploadChatFileParamsDTO
  ) {
    const userId = req.user.id;
    const subFolder = `chat/${params.chatId}`;
    return this.fileService.createFile(file, subFolder, userId);
  }

    @Post('profile')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
    @UseInterceptors(FileInterceptor('file', profileMulterConfig))
    @ApiOperation({ summary: 'Upload de foto de perfil do usuário' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    async uploadProfileImage(
      @UploadedFile() file: Express.Multer.File,
      @Req() req: Request & { user: { id: string } },
    ) {
      const userId = req.user.id;

      return this.fileService.uploadProfileImage(file, userId);
    }

    @Get('profile/:id')
    async getProfileImage(
      @Param('id') userId: string,
      @Res() res: Response
    ) {
      const filePath = await this.fileService.getProfileImage(userId);

      return res.sendFile(filePath, { root: './' });
}
}