
import  { AxiosError } from 'axios';
import api from "@/constants/Axios";

const handleErrors = (err: AxiosError) => {
    if (err && err.response && err.response.status === 401) {
        // AuthService.logout();
    }
        
    return err;
};


const Requests = {

    get: async (url: string) : Promise<any> => {
        try {
            const response = await api.get(url);
            return response;
        } catch (error : any) {
            return handleErrors(error);
        }
    },

    post: async (url: string, body: any): Promise<any> => {
        try {
            const response = await api.post(url, body);
            return response;
        } catch (error : any) {
            return handleErrors(error);
        }
    },

    put: async (url: string, body: any) : Promise<any> => {
        try {
            const response = await api.put(url, body);
            return response
        } catch (error : any) {
            return handleErrors(error);
        }
    },

    delete: async (url: string)  : Promise<any> => {
        try {
            const response = await api.delete(url);
            return response;
        } catch (error : any) {
            return handleErrors(error);
        }
    },
};

export default Requests;

