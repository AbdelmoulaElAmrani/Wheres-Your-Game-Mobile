import {UserResponse} from "@/models/responseObjects/UserResponse";

export class Message {
    // @ts-ignore
    public id?: string;
    // @ts-ignore
    public message: string;
    // @ts-ignore
    public timestamp: any;
    // @ts-ignore
    public senderId: string;
    // @ts-ignore
    public receiverId: string;

    constructor(messageId?: string, senderId?: string, content?: string, timestamp?: Date) {
        this.id = messageId || '';
        this.message = content || '';
        this.timestamp = timestamp || new Date();
        this.senderId = senderId || '';
    }
}


export class Conversation {
    // @ts-ignore
    public user?: UserResponse;
    public lastMessage?: Message;
    public lastActiveDate: Date;

    constructor(participant1?: UserResponse, lastMessage?: Message, lastActiveDate?: Date) {
        this.user = participant1 || undefined
        this.lastMessage = lastMessage || undefined;
        this.lastActiveDate = lastActiveDate || new Date();
    }
}
