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
            .findOneAndUpdate(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                { _id: raw._id },
                { $set: raw },
                { returnDocument: 'after' },
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
        let query: QueryFilter<NotificationSchemaClass> = {};
        if (filters?.userId) {
            query.clientId = filters.userId;
        }
        if (filters?.read !== undefined) {
            query.read = filters.read;
        }
        const docs = await this.notificationModel.find(query).lean<NotificationLean[]>().exec();
        return docs.map(NotificationMapper.toDomain);
    }
}