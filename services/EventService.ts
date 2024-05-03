import Requests from "@/services/Requests";
import {EventSearchRequest} from "@/models/requestObjects/EventSearchRequest";


export class EventService {

    public static getCoachEvents = async (userId: string, date: string, page: number, size: number) => {
        const res = await Requests.get(`event/all/${userId}?date=${date}&page=${page}&size=${size}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }


    public static getUserEvents = async (eventSearch: EventSearchRequest) => {
        const res = await Requests.post(`event/search`, eventSearch);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

}