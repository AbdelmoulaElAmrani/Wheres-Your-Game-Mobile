import Requests from "@/services/Requests";
import {Conversation, Message} from "@/models/Conversation";

export class ChatService {
    static async getConversation() {
        try {
            var res = await Requests.get(`chat/conversation`);
            if (res?.status === 200 && res?.data) {
                return res.data as Conversation[];
            }
            return undefined;
        } catch (error) {
            return undefined;
        }
    }

    static async getMessages(userId1: string, userId2: string, page = 0, size = 100) {
        try {
            var res = await Requests.get(`chat/messages?userId1=${userId1}&userId2=${userId2}&page=${page}&size=${size}`);
            if (res?.status === 200 && res?.data) {
                return res.data
            }
            return undefined;
        } catch (error) {
            return undefined;
        }
    }

    static async getLastMessages(sender: string, receiver: string) {
        try {
            var res = await Requests.get(`chat/lastMessages?sender=${sender}&receiver=${receiver}`);
            if (res?.status === 200 && res?.data) {
                return res.data as Message[];
            }
            return [];
        } catch (error) {
            return undefined;
        }
    }

    static async sendMessage(message: Message) {
        const res = await Requests.post('chat/message', message);
        if (res?.status === 200 && res?.data) {
            return res.data as Message;
        }
        throw Error();
    }

}