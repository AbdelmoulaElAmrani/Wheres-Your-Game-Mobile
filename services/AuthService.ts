import { AuthenticationRequest } from "@/models/requestObjects/AuthenticationRequest";
import LocalStorageService from "./LocalStorageService";
import Requests from "./Requests";
import { RegisterRequest } from "@/models/requestObjects/RegisterRequest";


export class AuthService {

    static  getAccessToken = async (): Promise<string | null> => {
        try {
             const token = await LocalStorageService.getItem<string>('accessToken');
            return token;
        } catch (err) {
            return null;
        }
    }

    static  getRefreshToken = async (): Promise<string | null> => {
        try {
             const token = await LocalStorageService.getItem<string>('refreshToken');
            return token;
        } catch (err) {
            return null;
        }
    }


    static  setAccessToken = (token: string): void => {
        LocalStorageService.storeItem<string>('accessToken', token);
    }

    static  setRefreshToken = (token: string): void => {
        LocalStorageService.storeItem<string>('refreshToken', token);
    }


    static setAuthTokens = (tokens: AuthenticationResponse): void => {
        AuthService.setAccessToken(tokens.token);
        AuthService.setRefreshToken(tokens.refreshToken);
    }

    static  refreshToken = (): string => {
         const token = '';
        return token;
    }

    static logIn = async (request: AuthenticationRequest): Promise<AuthenticationResponse | undefined> => {
        
            
            const res = await Requests.post('auth/login', request);
            
            if(res.status !== 200){
                return undefined;
            }

            if(res.data){
            AuthService.setAuthTokens(res.data);
            }

            return res.data; 
        
    }

    static register = async (request: RegisterRequest): Promise<AuthenticationResponse | undefined> => {
            
                
                const res = await Requests.post('auth/register', request);
                
                if(res.status !== 200){
                    return undefined;
                }
    
                return res.data; 
            
        }



}

