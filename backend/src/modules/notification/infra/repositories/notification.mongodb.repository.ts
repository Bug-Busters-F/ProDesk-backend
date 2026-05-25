import { InjectModel } from "@nestjs/mongoose";
import { NotificationLean, NotificationSchemaClass } from "../schemas/notification.mongo.schema";
import { Model, QueryFilter } from "mongoose";
import { INotificationRepository } from "../../domain/repository/notification.repository.interface";
import { NotificationMapper } from "../mappers/notification.mapper";
import { Notification } from "../../domain/entities/notification.entity";

export class NotificationMongoRepository extends INotificationRepository {
    constructor(
        @InjectModel(NotificationSchemaClass.name)
        private readonly notificationModel: Model<NotificationSchemaClass>,
    ) {
        super();
    }
    async create(notification: Notification): Promise<Notification> {
        const raw = NotificationMapper.toPersistence(notification);
        const created = await this.notificationModel.create(raw);
        return NotificationMapper.toDomain(created);
    }
    
    async update(notification: Notification): Promise<Notification | null> {

        const raw = NotificationMapper.toPersistence(notification);

        const updated = await this.notificationModel
            .findByIdAndUpdate(
                notification.id,
                { $set: raw },
                { new: true },
            )
            .lean<NotificationLean>()
            .exec();

        if (!updated) {
            return null;
        }

        return NotificationMapper.toDomain(updated);
    }
    async findByUserId(filters?: {
        userId?: string;
        read?: boolean;
    }): Promise<Notification[]> {

        const query: QueryFilter<NotificationSchemaClass> = {};

        if (filters?.userId) {

            query.$or = [
                { clientId: filters.userId },
                { supportAgentId: filters.userId },
            ];
        }

        if (filters?.read !== undefined) {
            query.read = filters.read;
        }

        const docs = await this.notificationModel
            .find(query)
            .lean<NotificationLean[]>()
            .exec();

        return docs.map(NotificationMapper.toDomain);
    }

    async findById(id: string): Promise<Notification | null> {
    const doc = await this.notificationModel
        .findById(id)
        .lean<NotificationLean>()
        .exec();

    if (!doc) {
        return null;
    }

    return NotificationMapper.toDomain(doc);
}
}