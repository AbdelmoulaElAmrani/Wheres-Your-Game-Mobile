import React, {useEffect} from "react"
import {Tabs} from "expo-router";
import Colors from "@/constants/Colors";
import {AntDesign, Feather, Ionicons, Octicons} from '@expo/vector-icons';
import {
    registerForPushNotificationsAsync,
    sendPushTokenToBackend,
    setupNotificationListeners
} from "@/services/pushNotificationService";
import LocalStorageService from "@/services/LocalStorageService";

const Layout = () => {

    useEffect(() => {
        async function setupPushNotifications() {
            try {
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    const result = await sendPushTokenToBackend(token);
                    if (result) await LocalStorageService.storeItem<string>('expoPushToken', token);
                }
            } catch (error) {
                console.error('Error setting up push notifications:', error);
            }
        }

        setupPushNotifications();
    }, []);

    useEffect(() => {
        const removeListeners = setupNotificationListeners(
            (notification) => {
                console.log('Notification received:', notification);
            },
            (response) => {
                console.log('Notification response:', response);
            }
        );

        return removeListeners;
    }, []);


    return (<Tabs
        screenOptions={{
            tabBarActiveTintColor: Colors.light.tabIconSelected,
            headerShown: false
        }}>
        <Tabs.Screen name="index" options={{
            title: '', tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) =>
                <AntDesign name="home" size={size} color={color}/>
        }}/>
        <Tabs.Screen name="Profile" options={{
            href: null,
            title: 'Profile', tabBarLabel: 'Profile',
            tabBarIcon: ({color, size}) =>
                <Octicons name="person" size={size} color={color}/>
        }}/>
        <Tabs.Screen name="ProfileV2" options={{
            title: 'Profile', tabBarLabel: 'Profile',
            tabBarIcon: ({color, size}) =>
                <Octicons name="person" size={size} color={color}/>
        }}/>
        <Tabs.Screen name="Calendar" options={{
            title: 'Calendar', tabBarLabel: 'Calendar',
            tabBarIcon: ({color, size}) =>
                <AntDesign name="calendar" size={size} color={color}/>
        }}/>
        <Tabs.Screen name="GClips" options={{
            title: 'G Clips', tabBarLabel: 'G Clips',
            tabBarIcon: ({color, size}) =>
                <Ionicons name="videocam-outline" size={size} color={color}/>
        }}/>
        <Tabs.Screen name="More" options={{
            title: 'More', tabBarLabel: 'More',
            tabBarIcon: ({color, size}) =>
                <Feather name="more-horizontal" size={size} color={color}/>
        }}/>
    </Tabs>);
};

export default Layout;