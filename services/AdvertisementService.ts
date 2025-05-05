import Requests from "@/services/Requests";

export class AdvertisementService {

    static submitAdvertisementRequest = async (data: { message: string}) => {
        try {
            const res = await Requests.post(`advertisementRequest`, data);
            return res?.status == 200;
        }catch (e){
            console.log(e);
            return false;
        }
    }
}