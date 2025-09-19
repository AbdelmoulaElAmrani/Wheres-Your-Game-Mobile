import {AuthenticationRequest} from "@/models/requestObjects/AuthenticationRequest";
import {RegisterRequest} from "@/models/requestObjects/RegisterRequest";
import LocalStorageService from "./LocalStorageService";
import Requests from "./Requests";
import {persistor} from "@/redux/ReduxConfig";
import {FeatureTogglingConfig} from "@/models/responseObjects/FeatureTogglingConfig";
import {GoogleUserRequest} from "@/models/requestObjects/GoogleUserRequest";
import TokenManager from "@/services/TokenManager";
import VerificationResponse from "@/models/responseObjects/VerificationResponse";

export class AuthService {

    static logOut = async (): Promise<void> => {
        await LocalStorageService.removeItem('accessToken');
        await LocalStorageService.removeItem('refreshToken');
        await LocalStorageService.removeItem('expoPushToken')
        await persistor.purge();
        await persistor.flush();
    }

    static refreshToken = async (): Promise<string | undefined> => {
        const res = await Requests.get('auth/refreshtoken',);
        if (res.status !== 200) {
            return undefined;
        }
        if (res.data) {
            TokenManager.setAuthTokens(res.data);
        }
        return res.data;
    }

    static logIn = async (request: AuthenticationRequest): Promise<AuthenticationResponse | undefined> => {
        const res = await Requests.post('auth/login', request);
        if (res?.status !== 200) {
            return undefined;
        }
        if (res.data) {
            TokenManager.setAuthTokens(res.data);
        }
        return res.data;
    }

    static register = async (request: RegisterRequest): Promise<AuthenticationResponse | undefined> => {
        const res = await Requests.post('auth/register', request);
        if (res?.status !== 200) {
            return undefined;
        }
        if (res.data) {
            TokenManager.setAuthTokens(res.data);
        }
        return res.data;
    }

    static sendOTP = async (): Promise<boolean | undefined> => {
        const res = await Requests.get('auth/generateOTP');
        return res?.status === 200;
    }

    static verifyOTP = async (code: string): Promise<boolean | undefined> => {
        const storedAuth = await LocalStorageService.getItem<boolean>("otp");

        if (storedAuth) {
            return storedAuth;
        }

        const res = await Requests.get(`auth/verifyOTP?otp=${code}`);
        if (res?.status !== 200) {
            await LocalStorageService.storeItem<boolean>("otp", false);
            return false;
        }
        await LocalStorageService.storeItem<boolean>("otp", res.data);
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

    static async loginOrSignWithGoogle(request: GoogleUserRequest) {
        const res = await Requests.post('auth/google', request);
        if (res.status !== 200 || !res.data) {
            return undefined;
        }
        TokenManager.setAuthTokens(res.data);
        return res.data;
    }

    static async changePassword(passwordData: {
        newPassword: string;
        confirmPassword: string;
        currentPassword: string
    }): Promise<boolean> {
        const body = {
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        }
        const res = await Requests.put('user/reset-password', body);
        return res?.status === 200;
    }

    static sendOTFG = async (email: string): Promise<boolean> => {
        try {
            const res = await Requests.get(`auth/generateOTP/${email}`);
            return res?.status === 200;
        }catch (e) {
            return false;
        }

    }

    static resetPasswordFG = async (resetPassword: {
        newPassword: string;
        resetToken: string
        id: string
    }): Promise<boolean | null> => {
        try {
            const res = await Requests.post(`auth/resetPassword`, resetPassword);
            return res?.status == 200;
        } catch (e) {
            console.log('resetPasswordFG', e);
            return false;
        }
    }
    static verifyOTPFG = async (code: string, email: string): Promise<VerificationResponse | null> => {
        try {
            console.log('AuthService: Sending verification request:', {code, email});
            const res = await Requests.post(`auth/verifyCode`, {code, email});
            console.log('AuthService: Response status:', res?.status);
            console.log('AuthService: Response data:', res?.data);
            
            if (res?.status == 200) {
                console.log('AuthService: Returning success response:', res.data);
                return res.data as VerificationResponse;
            }
            console.log('AuthService: Non-200 status, returning null');
            return null;
        } catch (e) {
            console.log('AuthService: Error in verifyOTPFG => ', e);
            return null;
        }
    }
}

