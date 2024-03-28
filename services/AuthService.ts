import LocalStorageService from "./LocalStorageService";


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



}

