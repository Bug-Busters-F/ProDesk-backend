import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserRole } from './user.schema';
import { UserDetails } from './user.interface';


@Injectable()
export class UserService {
    constructor(
        @InjectModel("User") private readonly userModel:
        Model<UserDocument>,
    ){}

    async findById(id: string): Promise<UserDetails | null> {
        const user = await this.userModel
            .findById(id)
            .populate("companyId")
            .populate("groupId")
            .exec();

        if (!user) return null;
        return this._getUser(user);
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({email})
            .populate("companyId")
            .populate("groupId")
            .exec();

    }

    async createUser(name: string, email: string, password: string, role: UserRole, companyId ?: string, groupId ?: string ): Promise<UserDocument> {
        const newUser = new this.userModel({
            name,
            email,
            password,
            role,
            companyId,
            groupId ,
        });
        return newUser.save()
    }

    _getUser(user: any): UserDetails {
    return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,

            company: user.companyId
            ? {
                id: user.companyId._id.toString(),
                name: user.companyId.name,
                cnpj: user.companyId.cnpj
                }
            : undefined,

            group: user.groupId
            ? {
                id: user.groupId._id.toString(),
                name: user.groupId.name
                }
            : undefined
        };
    }
}
