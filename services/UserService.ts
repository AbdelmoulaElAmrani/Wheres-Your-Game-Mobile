import {UserResponse} from "@/models/responseObjects/UserResponse";
import Requests from "./Requests";
import {UserRequest} from "@/models/requestObjects/UserRequest";


export class UserService {

    static getUser = async (): Promise<UserResponse | undefined> => {

        try {
            const res = await Requests.get('profile');

            if (res?.status === 200 && res.data) {
                return res.data as UserResponse;
            }

            console.error('Failed to fetch profile:', res.status);
            return undefined;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }
    static updateUser = async (user: UserRequest): Promise<UserResponse | undefined> => {
        try {
            const res = await Requests.put('profile', user);

            if (res.status === 200 && res.data) {
                return res.data as UserResponse;
            } else {
                console.error('Failed to update user:', res.status);
                return undefined;
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return undefined;
        }
    }
}