import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Requests from "./Requests";


// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications and return the token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token;

    // Check if device is physical (not an emulator)
    if (!Device.isDevice) {
        console.warn('Push notifications require a physical device to work properly');
        return null;
    }

    // Check for existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If no permission, request it
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    // Exit if permission not granted
    if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
    }

    // Get the token
    try {
        // For Expo SDK 51, we use getExpoPushTokenAsync
        token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }

    // Set up device-specific settings
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

/**
 * Send the push token to the backend for storage
 */
export async function sendPushTokenToBackend(token: string): Promise<boolean> {
    try {
        const response =  await Requests.post(`notification/push/token`, {pushToken: token})
        return response.status === 200 || response.status === 201;
    } catch (error) {
        console.error('Failed to send push token to backend:', error);
        return false;
    }
}

/**
 * Remove a push token from the backend (on logout)
 */
export async function removePushToken(token: string): Promise<boolean> {
    try {
        const response = await Requests.post(`notification/push/token/delete`, {pushToken: token})
        return response.status === 200;
    } catch (error) {
        console.error('Failed to remove push token from backend:', error);
        return false;
    }
}

/**
 * Set up notification listeners to handle received and interacted notifications
 * @param onNotificationReceived - Callback when notification is received
 * @param onNotificationResponse - Callback when user interacts with notification
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
    // When a notification is received while app is in foreground
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    // When the user taps on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        if (onNotificationResponse) {
            onNotificationResponse(response);
        }
    });

    // Return function to remove listeners when component unmounts
    return () => {
        Notifications.removeNotificationSubscription(receivedListener);
        Notifications.removeNotificationSubscription(responseListener);
    };
}
