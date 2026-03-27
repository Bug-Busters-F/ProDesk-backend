import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupDocument } from './group.schema';
import { GroupDetails } from './group.interface';

@Injectable()
export class GroupService {
    constructor(
        @InjectModel("Group") private readonly groupModel: Model<GroupDocument>
    ) {}

    async findAll(): Promise<GroupDetails[]> {
        const groups = await this.groupModel.find().exec();

        return groups.map(group => this._getGroup(group));
    }

    async findById(id: string): Promise<GroupDetails> {
        const group = await this.groupModel.findById(id).exec();

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        return this._getGroup(group);
    }

    async createGroup(name: string, description?: string): Promise<GroupDetails> {
        const newGroup = new this.groupModel({
            name,
            description
        });

        const savedGroup = await newGroup.save();

        return this._getGroup(savedGroup);
    }

    async updateGroup(id: string, data: Partial<GroupDetails>): Promise<GroupDetails> {
        const updatedGroup = await this.groupModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();

        if (!updatedGroup) {
            throw new NotFoundException('Group not found');
        }

        return this._getGroup(updatedGroup);
    }

    async deleteGroup(id: string): Promise<void> {
        const deletedGroup = await this.groupModel
            .findByIdAndDelete(id)
            .exec();

        if (!deletedGroup) {
            throw new NotFoundException('Group not found');
        }
    }

    private _getGroup(group: any): GroupDetails {
        return {
            id: group._id,
            name: group.name,
            description: group.description
        };
    }
}