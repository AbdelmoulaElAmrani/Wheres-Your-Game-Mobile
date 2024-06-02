import Requests from "./Requests";

export class NotificationService {
    

    static getNotifications = async () => {
        const res = await Requests.get('notification/all');
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }





}