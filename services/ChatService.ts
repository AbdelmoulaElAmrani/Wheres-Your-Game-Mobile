import Requests from "@/services/Requests";
import {Conversation, Message} from "@/models/Conversation";

export class ChatService {
    static async getConversation(childId: string | undefined = undefined) {
        try {
            var res = await Requests.get(`chat/conversation?childId=${childId}`);
            if (res?.status === 200 && res?.data) {
                return res.data as Conversation[];
            }
            return undefined;
        } catch (error) {
            return undefined;
        }
    }

    static async getMessages(userId2: string, page = 0, childId: string | undefined = undefined, size = 100) {
        try {
            var res = await Requests.get(`chat/messages?childId=${childId}&userId2=${userId2}&page=${page}&size=${size}`);
            if (res?.status === 200 && res?.data) {
                return res.data
            }
            return undefined;
        } catch (error) {
            return undefined;
        }
    }

    static async getLastMessages(userId2: string, from: any, childId: string | undefined = undefined) {
        try {
            var res = await Requests.get(`chat/lastMessages?childId=${childId}&userId2=${userId2}&from=${from}`);
            if (res?.status === 200 && res?.data) {
                return res.data as Message[];
            }
            return undefined;
        } catch (error) {
            return undefined;
        }
    }

    static async sendMessage(message: Message, childId: string | undefined = undefined) {
        const res = await Requests.post(`chat/message?childId=${childId}`, message);
        if (res?.status === 200 && res?.data) {
            return res.data as Message;
        }
        throw Error();
    }

}