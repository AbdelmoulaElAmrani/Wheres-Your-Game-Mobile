import axios, {AxiosError, AxiosRequestHeaders, AxiosResponse} from 'axios';
import {AuthService} from './AuthService';
import {router} from 'expo-router';
import {logout} from "@/redux/UserSlice";
import {API_URI, AXIOS_TIMEOUT} from "@/appConfig";
import TokenManager from "@/services/TokenManager";
let store: any;
export const injectStoreIntoAxios = (_store: any) => {
    store = _store;
}
const axiosInstance = axios.create({
    baseURL: API_URI,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: AXIOS_TIMEOUT
});
// Request Interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const isRefreshToken = config.url?.includes('refreshtoken');
        const isStorageRequest = config.url?.includes('storage');
        const accessToken: string | null = isRefreshToken
            ? await TokenManager.getRefreshToken()
            : await TokenManager.getAccessToken();

        if (!config.headers) {
            config.headers = {} as AxiosRequestHeaders;
        }

        if (accessToken) {
            (config.headers as AxiosRequestHeaders)['Authorizations'] = `Bearer ${accessToken}`;
        }

        if (isStorageRequest) {
            (config.headers as AxiosRequestHeaders)['Content-Type'] = 'multipart/form-data';
        } else {
            (config.headers as AxiosRequestHeaders)['Accept'] = 'application/json';
            (config.headers as AxiosRequestHeaders)['Content-Type'] = 'application/json';
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
        if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
            // @ts-ignore
            (originalRequest as any)._retry = true;
            try {
                const newAccessToken = await AuthService.refreshToken();
                if (newAccessToken) {
                    if (originalRequest.headers?.set) {
                        originalRequest.headers.set('Authorizations', `Bearer ${newAccessToken}`);
                    } else if (originalRequest.headers) {
                        (originalRequest.headers as any)['Authorizations'] = `Bearer ${newAccessToken}`;
                    }
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                store.dispatch(logout({}));
                router.replace('/Login');
                return Promise.reject(refreshError);
            }
        }
    }
);


const handleErrors = async (err: AxiosError) => {
    if (err.response?.status === 401) {
        console.warn('Unauthorized (401) — logging out user.');
        store.dispatch(logout({}));
        router.replace('/Login');
    } else {
        console.error('Axios error:', err);
    }
    return err;
};


const request = async <T = any>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    body?: any
): Promise<AxiosResponse<T>> => {
    try {
        const response = await axiosInstance.request<T>({
            method,
            url,
            ...(body && { data: body }),
        });
        return response;
    } catch (error: any) {
        await  handleErrors(error);
        throw error;
    }
};

const Requests = {
    get: <T = any>(url: string) => request<T>('get', url),
    post: <T = any>(url: string, body: any) => request<T>('post', url, body),
    put: <T = any>(url: string, body: any) => request<T>('put', url, body),
    delete: <T = any>(url: string) => request<T>('delete', url),
};

export default Requests;