import axios, {AxiosRequestConfig, AxiosResponse, AxiosError} from 'axios';
import {AuthService} from '@/services/AuthService';


export const API_URI = 'https://colour-american-arabia-bond.trycloudflare.com/api/'

const api = axios.create({
    baseURL: API_URI,
});


api.interceptors.request.use(
    // @ts-ignore
    async (config: AxiosRequestConfig) => {
        const token = await AuthService.getAccessToken();
        if (token) {
            config.headers = {...config.headers, Authorizations: `Bearer ${token}`};
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh logic
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        // Check if the error is due to a 401 Unauthorized response
        // @ts-ignore
        if (error.response?.status === 401 && !originalRequest._retry) {
            // @ts-ignore
            originalRequest._retry = true; // marking so we don't get into an infinite loop
            const accessToken = await AuthService.getRefreshToken();
            axios.defaults.headers.common['Authorizations'] = `Bearer ${accessToken}`;
            // @ts-ignore
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

export default api;
