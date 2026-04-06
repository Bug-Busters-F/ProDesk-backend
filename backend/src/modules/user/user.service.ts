import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserRole } from './user.schema';
import { UserDetails } from './user.interface';
import { CompanyService } from '../company/company.service';
import { GroupService } from '../group/group.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
    private companyService: CompanyService,
    private groupService: GroupService,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      name?: string;
      email?: string;
      role?: UserRole;
      companyId?: string;
      groupId?: string;
    },
  ): Promise<{
    data: UserDetails[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const query: any = {};

    if (filters?.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    if (filters?.email) {
      query.email = { $regex: filters.email, $options: 'i' };
    }

    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.companyId) {
      query.companyId = filters.companyId;
    }

    if (filters?.groupId) {
      query.groupId = filters.groupId;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .populate('companyId')
        .populate('groupId')
        .skip(skip)
        .limit(limit)
        .exec(),

      this.userModel.countDocuments(query),
    ]);

    return {
      data: users.map((user) => this._getUser(user)),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<UserDetails> {
    const user = await this.userModel
      .findById(id)
      .populate('companyId')
      .populate('groupId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this._getUser(user);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .populate('companyId')
      .populate('groupId')
      .exec();
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    companyId?: string,
    groupId?: string,
  ): Promise<UserDocument> {
    if (companyId) {
      const company = await this.companyService.findById(companyId);

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (groupId) {
      const group = await this.groupService.findById(groupId);

      if (!group) {
        throw new NotFoundException('Group not found');
      }
    }

    const newUser = new this.userModel({
      name,
      email,
      password,
      role,
      companyId,
      groupId,
    });

    const savedUser = await newUser.save();

    await savedUser.populate('companyId');
    await savedUser.populate('groupId');

    return savedUser;
  }

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      role: UserRole;
      companyId: string;
      groupId: string;
    }>,
  ): Promise<UserDetails> {
    if (data.email) {
      const existingUser = await this.findByEmail(data.email!);

      if (existingUser) throw new BadRequestException('Email taken!');
    }

    if (data.companyId) {
      const company = await this.companyService.findById(data.companyId);

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (data.groupId) {
      const group = await this.groupService.findById(data.groupId);

      if (!group) {
        throw new NotFoundException('Group not found');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('companyId')
      .populate('groupId')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this._getUser(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  _getUser(user: any): UserDetails {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,

      company: user.companyId
        ? {
            id: user.companyId._id,
            name: user.companyId.name,
            cnpj: user.companyId.cnpj,
          }
        : undefined,

      group: user.groupId
        ? {
            id: user.groupId._id,
            name: user.groupId.name,
            description: user.groupId.description,
          }
        : undefined,
    };
  }
}
