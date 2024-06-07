import NotificationType from "../NotificationType";

export interface NotificationResponse {
    id: string;
    content: string;
    type: NotificationType;
    senderId: string;
    senderFullName : string;
    imageUrl: string;
    creationDate: Date;
    isRead: boolean;
    requestId: string;
}

