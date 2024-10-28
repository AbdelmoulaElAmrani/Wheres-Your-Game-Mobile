import {UserResponse} from "@/models/responseObjects/UserResponse";
import Requests from "./Requests";
import {UserRequest} from "@/models/requestObjects/UserRequest";
import UserType from "@/models/UserType";
import { SocialMediaLinksResponse } from "@/models/responseObjects/SocialMediaLinksResponse";
import { SocialMediaLinksRequest } from "@/models/requestObjects/SocialMediaLinksRequest";


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
                userTpe = UserType[type];
            var res = await Requests.get(`user/search?fullName=${searchName}&type=${userTpe}`);
            if (res?.status === 200 && res?.data) {
                return res?.data as UserSearchResponse [];
            }
            return undefined;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }

    static async deleteUserProfile(): Promise<boolean> {
        try {
            const response = await Requests.delete('user');
            if (response?.status === 200) {
                return response.data;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    static async updateUserSocialLinks(social: SocialMediaLinksRequest): Promise<SocialMediaLinksResponse | undefined> {
        try {
            var res = await Requests.put('user/social', social);

            if (res?.status === 200 && res?.data) {
                return res?.data as SocialMediaLinksResponse;
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