export class ReceivedMessageNotificationEvent {

    constructor(

        public readonly receiverId: string,

        public readonly chatId: string,

        public readonly messageId: string,

        public readonly senderId: string,

        public readonly senderName: string,

        public readonly contentPreview: string,

        public readonly type: string,

        public readonly unreadCount: number,

        public readonly createdAt: Date,
    ) {}
}