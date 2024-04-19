import axios, { AxiosError, AxiosResponse } from 'axios';
import { AuthService } from './AuthService';
import { router } from 'expo-router';


const PREFIX = 'api'

export const API_URI = `https://manuals-helps-built-sat.trycloudflare.com/${PREFIX}/`

const axiosInstance = axios.create({
    baseURL: API_URI,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Request Interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const accessToken = await AuthService.getAccessToken();
        if (accessToken) {
            config.headers.Authorizations = `Bearer ${accessToken}`;
            config.headers = { ...config.headers, Authorizations: `Bearer ${accessToken}` } as any;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response : AxiosResponse) => response,
    async (error : AxiosError) => {
        if (error.response && error.response.status === 401) {
            try {
                const newAccessToken = await AuthService.refreshToken();
                if (newAccessToken) {
                    if (error.config && error.config.headers) {
                        error.config.headers['Authorizations'] = `Bearer ${newAccessToken}`;
                        return axiosInstance.request(error.config);
                    }
                }
            }
            catch (err) {
                router.replace("/Login");
            }
        }
    }
);



const handleErrors = async (err: AxiosError) => {
    if (err && err.response && err.response.status === 401) {
        router.replace("/Login");
    }
    return err;
};


const Requests = {

    get: async (url: string) : Promise<any> => {
        try {
            const response = await axiosInstance.get(url);
            return response;
        } catch (error : any) {
            return handleErrors(error);
        }
    },

    post: async (url: string, body: any): Promise<any> => {
        try {
            const response = await axiosInstance.post(url, body);
            return response;
        } catch (error : any) {
            return handleErrors(error);
        }
    },

    put: async (url: string, body: any) : Promise<any> => {
        try {
            const response = await axiosInstance.put(url, body);
            return response
        } catch (error : any) {
            return handleErrors(error);
        }
    },

    delete: async (url: string)  : Promise<any> => {
        try {
            const response = await axiosInstance.delete(url);
            return response;
        } catch (error : any) {
            return handleErrors(error);
        }
    },
};

export default Requests;

