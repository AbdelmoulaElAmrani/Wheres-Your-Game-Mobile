import Requests from "@/services/Requests";
import {SportEventRequest} from "@/models/requestObjects/SportEventRequest";
import {SportEvent} from "@/models/SportEvent";


export class EventService {

    public static createEvent = async (sportEvent: SportEventRequest) => {
        const res = await Requests.post("event/create", sportEvent);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    public static editeEvent = async (sportEvent: any) => {
        const res = await Requests.put("event/update", sportEvent);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    public static getEvents = async (userId: string, date: string, page: number, size: number, zipCode?: string | '') => {
        const res = await Requests.get(`event/all/${userId}?date=${date}&page=${page}&size=${size}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    public static getEventsForMap = async (zipCode?: string) => {
        const url = zipCode && zipCode.length > 0
            ? `event/map-upcoming?zipCode=${encodeURIComponent(zipCode)}`
            : 'event/map-upcoming';
        const res = await Requests.get(url);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }
}