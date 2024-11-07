import Requests from "./Requests";

export class PlayerService {

    static async getAllPlayersIntressedOnSportByFilter(sportId: string, level: string | '', zipCode: string | '', age: number | 0) {
        const res = await Requests.get(`player/allPlayers/${sportId}?level=${level}&zipCode=${zipCode}&age=${age}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

}