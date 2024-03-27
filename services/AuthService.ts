import LocalStorageService from "./LocalStorageService";

export const getAccessToken = async (): Promise<string | null> => {
    try {
        const token = await LocalStorageService.getItem<string>('accessToken');
        return token;
    } catch (err) {
        return null;
    }
}

export const getRefreshToken = async (): Promise<string | null> => {
    try {
        const token = await LocalStorageService.getItem<string>('refreshToken');
        return token;
    } catch (err) {
        return null;
    }
}


export const setAccessToken = (token: string): void => {
    LocalStorageService.storeItem<string>('accessToken', token);
}

export const setRefreshToken = (token: string): void => {
    LocalStorageService.storeItem<string>('refreshToken', token);
}


export const setAuthTokens = (tokens: AuthenticationResponse): void => {
    setAccessToken(tokens.token);
    setRefreshToken(tokens.refreshToken);
}



export const refreshToken = (): string => {
    const token = '';
    return token;
}