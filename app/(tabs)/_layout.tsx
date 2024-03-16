import React from "react"
import {Tabs} from "expo-router";
import Colors from "@/constants/Colors";
import {AntDesign, Feather, Ionicons, Octicons} from '@expo/vector-icons';

const Layout = () => {
    return (<Tabs
        screenOptions={{
            tabBarActiveTintColor: Colors.light.tabIconSelected
        }}>
        <Tabs.Screen name="index" options={{
            title: '', tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) =>
                <AntDesign name="home" size={size} color={color}/>
        }}/>
        <Tabs.Screen name="Profile" options={{
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