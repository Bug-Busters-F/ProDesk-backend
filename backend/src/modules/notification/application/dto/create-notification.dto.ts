import { NotificationType } from "../../shared/enums/notification.enum";


export interface CreateNotificationDTO {
    title: string;
    message: string;
    clientId: string;
    supportAgentId: string;
    type: NotificationType;
}