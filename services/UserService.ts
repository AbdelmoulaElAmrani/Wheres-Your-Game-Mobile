import { UserResponse } from "@/models/responseObjects/UserResponse";
import Requests from "./Requests";
import { UserRequest } from "@/models/requestObjects/UserRequest";



export class UserService {

    static getUser = async (): Promise<UserResponse | undefined> => {
            var res = await Requests.get('profile');

            if (res.status !== 200) {
                return undefined;
            }

            if (res.data) {
                return res.data;
            }
            return undefined;
    }
    static updateUser = async (user: UserRequest): Promise<UserResponse | undefined> => {
        var res = await Requests.put('profile', user);

        if (res.status !== 200) {
            return undefined;
        }

        if (res.data) {
            return res.data;
        }
        return undefined;
    }


}