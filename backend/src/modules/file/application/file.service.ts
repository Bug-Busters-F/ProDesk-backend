import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from '../infra/schemas/file.schema';
import { FileEntity } from '../domain/file.entity';
import { LocalStorage } from '../infra/storage/local.storage';
import { UserDocument } from '../../user/user.schema';
import * as fs from 'fs';
import { CompanyDocument } from '../../company/company.schema';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('File')
    private readonly fileModel:
    Model<FileDocument>,

    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,

    @InjectModel('Company')
    private readonly companyModel: Model<CompanyDocument>,

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

  async getProfileImage(userId: string): Promise<string | null> {
    const user = await this.userModel.findById(userId);

    if (!user || !user.profileImage) {
      return null;
    }

    if (!fs.existsSync(user.profileImage)) {
      return null;
    }

    return user.profileImage;
  }

  async deleteUserProfileImage(userId: string): Promise<void> {
  const user = await this.userModel.findById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.profileImage) {
    throw new BadRequestException('User does not have a profile image');
  }

  this.storage.delete(user.profileImage);

  await this.userModel.findByIdAndUpdate(userId, {
    profileImage: null,
  });
}

  async uploadCompanyLogo(
    file: Express.Multer.File,
    companyId: string
  ): Promise<FileEntity> {

    const fileData = this.storage.save(
      file,
      `company/${companyId}`,
      companyId
    );

    const newFile = new this.fileModel({
      filename: fileData.filename,
      originalname: fileData.originalname,
      mimetype: fileData.mimetype,
      size: fileData.size,
      path: fileData.path,
      uploadedBy: companyId
    });

    const savedFile = await newFile.save();

    const company = await this.companyModel.findById(companyId);


    if (company?.logo) {
      this.storage.delete(company.logo);
    }

    await this.companyModel.findByIdAndUpdate(companyId, {
      logo: fileData.path
    });

    return this._mapToEntity(savedFile);
  }

  async getCompanyLogo(companyId: string): Promise<string | null> {
    const company = await this.companyModel.findById(companyId);

    if (!company || !company.logo) {
      return null;
    }

    if (!fs.existsSync(company.logo)) {
      await this.companyModel.findByIdAndUpdate(companyId, {
        logo: null
      });
      return null;
    }

    return company.logo;
  }

  async deleteCompanyImage(companyId: string): Promise<void> {
  const company = await this.companyModel.findById(companyId);

  if (!company) {
    throw new NotFoundException('Company not found');
  }

  if (!company.logo) {
    throw new BadRequestException('Company does not have an image');
  }

  this.storage.delete(company.logo);

  await this.companyModel.findByIdAndUpdate(companyId, {
    image: null,
  });
}
}