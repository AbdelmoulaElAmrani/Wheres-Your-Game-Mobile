import axios, {AxiosError, AxiosResponse} from 'axios';
import {AuthService} from './AuthService';
import {router} from 'expo-router';
import {logout} from "@/redux/UserSlice";


const PREFIX = 'api'
export const API_URI = `https://cordless-outputs-prompt-horses.trycloudflare.com/${PREFIX}/`
//export const API_URI = `https://sport-app-38dd22818116.herokuapp.com/${PREFIX}/`


let store: any;
export const injectStoreIntoAxios = (_store: any) => {
    store = _store;
}

const axiosInstance = axios.create({
    baseURL: API_URI,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 3000
});
// Request Interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const accessToken = await AuthService.getAccessToken();
        if (accessToken) {
            config.headers.Authorizations = `Bearer ${accessToken}`;
            config.headers = {...config.headers, Authorizations: `Bearer ${accessToken}`} as any;
        }
        if (config.url?.includes('storage')) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            config.headers.Accept = 'application/json';
            config.headers["Content-Type"] = 'application/json';
        }

        return config
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        // @ts-ignore
        if (error.response.status === 401 && !originalRequest['_retry']) {
            // @ts-ignore
            originalRequest['_retry'] = true;
            try {
                const newAccessToken = await AuthService.refreshToken();
                if (newAccessToken) {
                    if (error.config && error.config.headers) {
                        error.config.headers['Authorizations'] = `Bearer ${newAccessToken}`;
                        return axiosInstance.request(error.config);
                    }
                }
            } catch (err) {
            }
        } else {
            if (error?.response?.status !== 500 && error?.response?.status !== 408 && error?.response?.status !== 502) {
                console.log('logout');
                store.dispatch(logout({}));
                router.replace("/Login");
            }
        }
    }
);


const handleErrors = async (err: AxiosError) => {
    if (err && err.response && err.response.status === 401) {
        console.log('logout');
        store.dispatch(logout({}));
        router.replace("/Login");
    }
    return err;
};


const Requests = {

    get: async (url: string): Promise<any> => {
        try {
            const response = await axiosInstance.get(url);
            return response;
        } catch (error: any) {
            return handleErrors(error);
        }
    },

    post: async (url: string, body: any): Promise<any> => {
        try {
            const response = await axiosInstance.post(url, body);
            return response;
        } catch (error: any) {
            return handleErrors(error);
        }
    },

    put: async (url: string, body: any): Promise<any> => {
        try {
            const response = await axiosInstance.put(url, body);
            return response
        } catch (error: any) {
            return handleErrors(error);
        }
    },

    delete: async (url: string): Promise<any> => {
        try {
            const response = await axiosInstance.delete(url);
            return response;
        } catch (error: any) {
            return handleErrors(error);
        }
    },
};

export default Requests;

