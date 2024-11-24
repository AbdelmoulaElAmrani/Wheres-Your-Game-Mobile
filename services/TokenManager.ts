import LocalStorageService from "@/services/LocalStorageService";

export class TokenManager {

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
        TokenManager.setAccessToken(tokens.token);
        TokenManager.setRefreshToken(tokens.refreshToken);
    }

}

export default TokenManager;