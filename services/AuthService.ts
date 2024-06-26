import {AuthenticationRequest} from "@/models/requestObjects/AuthenticationRequest";
import {RegisterRequest} from "@/models/requestObjects/RegisterRequest";
import LocalStorageService from "./LocalStorageService";
import Requests from "./Requests";
import {persistor} from "@/redux/ReduxConfig";
import {FeatureTogglingConfig} from "@/models/responseObjects/FeatureTogglingConfig";
import {GoogleUserRequest} from "@/models/requestObjects/GoogleUserRequest";
import {User} from "@react-native-google-signin/google-signin";


export class AuthService {

    static logOut = async (): Promise<void> => {
        await LocalStorageService.removeItem('accessToken');
        await LocalStorageService.removeItem('refreshToken');
        await persistor.purge();
        await persistor.flush();
    }

    static getAccessToken = async (): Promise<string | null> => {
        try {
            const token = await LocalStorageService.getItem<string>('accessToken');
            return token;
        } catch (err) {
            return null;
        }
    }

    static getRefreshToken = async (): Promise<string | null> => {
        try {
            const token = await LocalStorageService.getItem<string>('refreshToken');
            return token;
        } catch (err) {
            return null;
        }
    }

    static setAccessToken = (token: string): void => {
        LocalStorageService.storeItem<string>('accessToken', token);
    }

    static setRefreshToken = (token: string): void => {
        LocalStorageService.storeItem<string>('refreshToken', token);
    }

    static setAuthTokens = (tokens: AuthenticationResponse): void => {
        AuthService.setAccessToken(tokens.token);
        AuthService.setRefreshToken(tokens.refreshToken);
    }

    static refreshToken = async (): Promise<string | undefined> => {
        const res = await Requests.get('auth/refreshtoken',);
        if (res.status !== 200) {
            return undefined;
        }
        if (res.data) {
            AuthService.setAuthTokens(res.data);
        }
        return res.data;
    }

    static logIn = async (request: AuthenticationRequest): Promise<AuthenticationResponse | undefined> => {
        const res = await Requests.post('auth/login', request);
        if (res?.status !== 200) {
            return undefined;
        }
        if (res.data) {
            AuthService.setAuthTokens(res.data);
        }
        return res.data;
    }

    static register = async (request: RegisterRequest): Promise<AuthenticationResponse | undefined> => {
        const res = await Requests.post('auth/register', request);
        if (res?.status !== 200) {
            return undefined;
        }
        if (res.data) {
            AuthService.setAuthTokens(res.data);
        }
        return res.data;
    }

    static sendOTP = async (): Promise<boolean | undefined> => {
        const res = await Requests.get('auth/generateOTP');
        return res?.status === 200;
    }

    static verifyOTP = async (code: string): Promise<boolean | undefined> => {
        const res = await Requests.get(`auth/verifyOTP?otp=${code}`);
        if (res?.status !== 200) {
            return false;
        }
        return res.data;
    }

    static verifyEmail = async (email: string): Promise<boolean | undefined> => {
        const res = await Requests.get(`auth/verify-email/${email}`);
        if (res?.status !== 200) {
            return false;
        }
        return res.data;
    }

    static featureTogglingConfig = async (): Promise<FeatureTogglingConfig | undefined> => {
        const res = await Requests.get('auth/fTConfig');
        if (res?.status !== 200) {
            return undefined;
        }
        return res.data;
    }

    static async loginOrSignWithGoogle(request: User) {
        const res = await Requests.post('auth/google', request);
        if (res.status !== 200 || !res.data) {
            return undefined;
        }
        AuthService.setAuthTokens(res.data);
        return res.data;
    }
}

