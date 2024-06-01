import Requests from "@/services/Requests";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Conversation} from "@/models/Conversation";

export class ChatService {
    static async getConversation() {
        try {
            var res = await Requests.get(`conversation`);
            if (res?.status === 200 && res?.data) {
                return res?.data as Conversation[];
            }
            return undefined;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }
}