
import Requests from "@/services/Requests";


export class EventService {

    public static getCoachEvents = async (userId: string, date: string , page : number, size : number) => {
        const res = await Requests.get(`event/all/${userId}?date=${date}&page=${page}&size=${size}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
        
    }



}