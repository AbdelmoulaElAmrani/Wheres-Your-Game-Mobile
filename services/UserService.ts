import {UserResponse} from "@/models/responseObjects/UserResponse";
import Requests from "./Requests";
import {UserRequest} from "@/models/requestObjects/UserRequest";
import UserType from "@/models/UserType";


export class UserService {

    static getUser = async (): Promise<UserResponse | undefined> => {
        try {
            var res = await Requests.get('user/profile');

            if (res?.status === 200 && res?.data) {
                return res?.data as UserResponse;
            }
            console.error('Failed to fetch profile:', res?.status);
            return undefined;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }
    static updateUser = async (user: UserRequest): Promise<UserResponse | undefined> => {
        try {
            var res = await Requests.put('user/profile', user);

            if (res?.status === 200 && res?.data) {
                return res?.data as UserResponse;
            } else {
                console.error('Failed to update user:', res.status);
                return undefined;
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return undefined;
        }
    }

    static async getUserProfileById(id: string) {
        try {
            var res = await Requests.get(`user/${id}`);
            if (res?.status === 200 && res?.data) {
                return res?.data as UserResponse;
            }
            return undefined;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }

    static async SearchUsersByFullName(searchName: string, type: UserType | null = null) {
        try {
            let userTpe = 'ALL';
            if (type != null)
                userTpe = type.toString();
            var res = await Requests.get(`user/search?fullName=${searchName}&type=${userTpe}`);
            if (res?.status === 200 && res?.data) {
                return res?.data as UserResponse [];
            }
            return undefined;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }
}