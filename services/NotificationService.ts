import Requests from "./Requests";
import {NotificationResponse} from "@/models/responseObjects/NotificationResponse";

export class NotificationService {
    static getNotifications = async () => {
        try {
            const res = await Requests.get('notification/all');
            return res?.status === 200 ? res.data as NotificationResponse[] : undefined;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return undefined;
        }
    }

    static async markNotificationAsRead(notificationId: string) {
        await Requests.post(`notification/markAsRead/${notificationId}`, {});
    }
}