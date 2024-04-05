import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LocalStorageService {
    static async storeItem<T>(key: string, value: T): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error(error);
        }
    }

    static async getItem<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    static async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(error);
        }
    }
}
