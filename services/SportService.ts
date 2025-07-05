import Sport from "@/models/Sport";
import Requests from "./Requests";
import {UserInterestedSport} from "@/models/UserInterestedSport";

export class SportService {

    static getAllSports = async () : Promise<Sport[] | undefined>  => {
        const res = await Requests.get('sport/all');
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static registerUserToSport = async (userInterestedSports: UserInterestedSport[], userId: string) => {
        const res = await Requests.post(`sport/registerUserToSport/${userId}`, userInterestedSports);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static getUserSport = async (userId: string) => {
        const res = await Requests.get(`sport/user/${userId}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static deleteUserSport = async (userId: string, sportId: string) => {
        const res = await Requests.delete(`sport/user/${userId}/sport/${sportId}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static deleteAllUserSports = async (userId: string) => {
        const res = await Requests.delete(`sport/user/${userId}/sports`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }
}