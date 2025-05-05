import {Stack} from "expo-router";
import UserProfile from "@/app/(user)/UserProfile";

const UserLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="EditProfile" options={{headerShown: false}}/>
        <Stack.Screen name="SportInterested" options={{headerShown: false}}/>
        <Stack.Screen name="(Chat)" options={{headerShown: false}}/>
        {/*<Stack.Screen name="EditCoachProfile" options={{headerShown: false}}/>*/}
        <Stack.Screen name="Notifications" options={{headerShown: false}}/>
        <Stack.Screen name="(search)" options={{headerShown: false}}/>
        <Stack.Screen name="UserProfile" options={{headerShown: false}}/>
    </Stack>);
}


export default UserLayout