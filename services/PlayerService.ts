import Requests from "./Requests";

export class PlayerService {


    //http://localhost:8080/api/player/allPlayers/8a04fb73-32b9-495d-a0ae-0ff7c5aca484?level=Beginner&zipCode=1234&age=0

    static async getAllPlayersIntressedOnSportByFilter(sportId: string, level: string | '', zipCode: string | '', age: number | 0) {
        const res = await Requests.get(`player/allPlayers/${sportId}?level=${level}&zipCode=${zipCode}&age=${age}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

}