import {Team} from "@/models/Team";
import Requests from "@/services/Requests";

export class TeamService {
    static getUserTeams = async (userId: string) => {
        const res = await Requests.get(`team/${userId}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static getTeamPlayers = async (userId: string) => {
        const res = await Requests.get(`team/${userId}`);
        if (res?.status !== 200)
            return undefined;
        return res?.data;
    }
}