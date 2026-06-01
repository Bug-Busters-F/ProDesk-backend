import { randomUUID } from "crypto";
import { NotificationType } from "../../shared/enums/notification.enum";

export class Notification {
    private _id: string;
    private _title: string;
    private _message: string;
    private _clientId: string;
    private _supportAgentId: string;
    private _chatId?: string;
    private _ticketId?: string;
    private _read: boolean;
    private _type: NotificationType;
    createdAt: Date;

    constructor(
        title: string,
        message: string,
        clientId: string,
        supportAgentId: string,
        type: NotificationType,
        chatId?: string,
        ticketId?: string,
    ) {
        this._title = title;
        this._message = message;
        this._clientId = clientId;
        this._supportAgentId = supportAgentId;
        this._type = type;
        this._chatId = chatId;
        this._ticketId = ticketId;
    }

    get id() { return this._id; }
    get title() { return this._title; }
    get message() { return this._message; }
    get clientId() { return this._clientId; }
    get supportAgentId() { return this._supportAgentId; }
    get chatId() { return this._chatId; }
    get ticketId() { return this._ticketId; }
    get read() { return this._read; }
    get type() { return this._type; }

    static create(props: {
        title: string;
        message: string;
        clientId: string;
        supportAgentId: string;
        type: NotificationType;
        chatId?: string;
        ticketId?: string;
    }): Notification {

        const notification = new Notification(
            props.title,
            props.message,
            props.clientId,
            props.supportAgentId,
            props.type,
            props.chatId,
            props.ticketId,
        );

        notification._id = randomUUID();
        notification._read = false;

        return notification;
    }

    static restore(props: {
        id: string;
        title: string;
        message: string;
        clientId: string;
        supportAgentId: string;
        read: boolean;
        type: NotificationType;
        createdAt: Date;
        chatId?: string;
        ticketId?: string;
    }): Notification {

        const notification = new Notification(
            props.title,
            props.message,
            props.clientId,
            props.supportAgentId,
            props.type,
            props.chatId,
            props.ticketId,
        );

        notification._id = props.id;
        notification.createdAt = props.createdAt;
        notification._read = props.read;

        return notification;
    }

    markAsRead(): void {
        this._read = true;
    }

    toPrimitives() {
        return {
            id: this._id,
            title: this._title,
            message: this._message,
            clientId: this._clientId,
            supportAgentId: this._supportAgentId,
            chatId: this._chatId,
            ticketId: this._ticketId,
            read: this._read,
            type: this._type,
            createdAt: this.createdAt,
        };
    }
}