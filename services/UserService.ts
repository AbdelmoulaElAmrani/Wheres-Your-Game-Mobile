import {UserResponse} from "@/models/responseObjects/UserResponse";
import Requests from "./Requests";
import {UserRequest} from "@/models/requestObjects/UserRequest";
import UserType from "@/models/UserType";
import {SocialMediaLinksResponse} from "@/models/responseObjects/SocialMediaLinksResponse";
import {SocialMediaLinksRequest} from "@/models/requestObjects/SocialMediaLinksRequest";
import {User} from "@react-native-google-signin/google-signin";
import {UserSettingsRequest} from "@/models/requestObjects/UserSettingsRequest";


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

    static async getUserProfileById(id: string, childId: string | undefined = "") {
        try {
            if (!childId) childId = "";
            var res = await Requests.get(`user/${id}?childId=${childId}`);
            if (res?.status === 200 && res?.data) {
                return res?.data as UserResponse;
            }
            return undefined;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return undefined;
        }
    }

    static async SearchUsersByFullName(searchName: string, type: UserType | null = null, isParenting: boolean = false) {
        try {
            let userTpe = 'ALL';
            if (type != null)
                userTpe = UserType[type];
            var res = await Requests.get(`user/search?fullName=${searchName}&type=${userTpe}&isParenting=${isParenting}`);
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


    static async followUser(id: string | undefined) {
        try {
            var res = await Requests.post(`follows/${id}`, {});
            return res?.status === 201;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    static async updateProfilePreference(formData: any): Promise<boolean> {
        try {
            var res = await Requests.put('user/preferences', formData);
            return res?.status === 200;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    static updateUserSettings = async (formData: UserSettingsRequest): Promise<boolean> => {
        try {
            var res = await Requests.put('user/settings', formData);
            return res?.status === 200;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    static async getUserInfoByEmail(email: string) {
        try {
            var res = await Requests.get(`user/public/info/${email}`);
            if(res?.status === 200) return res.data;
            else return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}