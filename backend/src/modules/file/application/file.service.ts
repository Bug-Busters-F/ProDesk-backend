import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from '../infra/schemas/file.schema';
import { FileEntity } from '../domain/file.entity';
import { LocalStorage } from '../infra/storage/local.storage';
import { UserDocument } from '../../user/user.schema';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('File')
    private readonly fileModel:
    Model<FileDocument>,

    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,

    private readonly storage:
    LocalStorage
  ) {}

  async createFile(
    file: Express.Multer.File,
    subFolder: string,
    uploadedBy?: string
  ): Promise<FileEntity> {
    const fileData =
      this.storage.save(
        file,
        subFolder,
        uploadedBy
      );

    const newFile =
      new this.fileModel({
        filename: fileData.filename,
        originalname:
          fileData.originalname,
        mimetype:
          fileData.mimetype,
        size:
          fileData.size,
        path:
          fileData.path,
        uploadedBy:
          fileData.uploadedBy
      });

    const savedFile =
      await newFile.save();
    return this._mapToEntity(
      savedFile
    );
  }

async uploadProfileImage(
    file: Express.Multer.File,
    userId: string
  ): Promise<FileEntity> {

    const fileData = this.storage.save(
      file,
      `profile/${userId}`,
      userId
    );

    const newFile = new this.fileModel({
      filename: fileData.filename,
      originalname: fileData.originalname,
      mimetype: fileData.mimetype,
      size: fileData.size,
      path: fileData.path,
      uploadedBy: fileData.uploadedBy
    });

    const savedFile = await newFile.save();

    const user = await this.userModel.findById(userId);

    if (user?.profileImage) {
      this.storage.delete(user.profileImage);
    }

    await this.userModel.findByIdAndUpdate(userId, {
      profileImage: fileData.path
    });

    return this._mapToEntity(savedFile);
  }

  private _mapToEntity(
    file: any
  ): FileEntity {
    return {
      id: file._id,
      filename: file.filename,
      originalname:
        file.originalname,
      mimetype:
        file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy:
        file.uploadedBy,
      createdAt:
        file.createdAt
    };
  }

  async getProfileImage(userId: string): Promise<string> {
  const user = await this.userModel.findById(userId);

  if (!user || !user.profileImage) {
    throw new NotFoundException('Profile image not found');
  }

  return user.profileImage;
}
}