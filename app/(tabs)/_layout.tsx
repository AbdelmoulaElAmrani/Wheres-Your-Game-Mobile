import React, {useEffect, useState} from "react"
import {Tabs} from "expo-router";
import Colors from "@/constants/Colors";
import {AntDesign, Feather, Ionicons, Octicons} from '@expo/vector-icons';
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {getUserProfile} from "@/redux/UserSlice";
import {
    registerForPushNotificationsAsync,
    sendPushTokenToBackend,
    setupNotificationListeners
} from "@/services/pushNotificationService";
import LocalStorageService from "@/services/LocalStorageService";

const Layout = () => {

    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.user.userData) as UserResponse | null;

    useEffect(() => {
        if (!userData || !userData.id) {
            dispatch(getUserProfile() as any);
        }
    }, [userData]);

    useEffect(() => {
        if (!userData || !userData.id) return;

        async function setupPushNotifications() {
            try {
                // Register for push notifications and get token
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
    }, [userData]);

    // Set up notification listeners
    useEffect(() => {
        // setting up listeners with custom handlers
        const removeListeners = setupNotificationListeners(
            (notification) => {
                // Handle notification received when app is in foreground
                console.log('Notification received:', notification);
            },
            (response) => {
                // Handle notification response (user tapped on notification)
                console.log('Notification response:', response);

                // Here you can navigate to a specific screen based on the notification
                // Example:
                // const data = response.notification.request.content.data;
                // if (data.type === 'message') {
                //   navigation.navigate('Messages', { id: data.messageId });
                // }
            }
        );

        // Clean up listeners on unmount
        return removeListeners;
    }, []);
    if (!userData) return null;
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