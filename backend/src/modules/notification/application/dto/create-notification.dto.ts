import { NotificationType } from "../../shared/enums/notification.enum";


export interface CreateNotificationDTO {
    title: string;
    message: string;
    clientId: string;
    supportAgentId: string;
    type: NotificationType;
}

export interface CreateMessageNotificationDTO {
    receiverId: string;

    senderId: string;

    senderName: string;

    chatId: string;

    messageId: string;

    contentPreview: string;

    unreadCount: number;

    createdAt: Date;
}