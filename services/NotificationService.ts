import Requests from "./Requests";
import {NotificationResponse} from "@/models/responseObjects/NotificationResponse";

export class NotificationService {


    static getNotifications = async () => {
        const res = await Requests.get('notification/all');
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data as NotificationResponse [];
    }


}