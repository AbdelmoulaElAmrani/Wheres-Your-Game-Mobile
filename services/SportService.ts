import Sport from "@/models/Sport";
import Requests from "./Requests";

export class SportService {

    static getAllSports = async () : Promise<Sport[] | undefined>  => {
        const res = await Requests.get('sport/all');
        
        if (res.status !== 200) {
            return undefined;
        }

        return res.data;
    }

};