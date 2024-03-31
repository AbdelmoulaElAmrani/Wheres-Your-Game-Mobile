
import axios, { AxiosError } from 'axios';


export const API_URI = 'https://matrix-beneath-aspects-bill.trycloudflare.com/api/'

const axiosInstance = axios.create({
    baseURL: API_URI,
    headers: {
        'Content-Type': 'application/json',
    },
});

const handleErrors = (err: AxiosError) => {
    if (err && err.response && err.response.status === 401) {
        // AuthService.logout();
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

