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
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }

    static async getMessages(sender: string, receiver: string, page = 0, size = 100) {
        try {
            var res = await Requests.get(`chat/messages?sender=${sender}&receiver=${receiver}&page=${page}&size=${size}`);
            if (res?.status === 200 && res?.data) {
                return res.data
            }
            return [];
        } catch (error) {
            console.error('Error fetching profile:', error);
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
            console.error('Error fetching profile:', error);
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