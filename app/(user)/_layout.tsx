import {Stack} from "expo-router";

const UserLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="EditProfile" options={{headerShown: false}}/>
        <Stack.Screen name="SportInterested" options={{headerShown: false}}/>
        <Stack.Screen name="Chats" options={{headerShown: false}}/>
        <Stack.Screen name="EditCoachProfile" options={{headerShown: false}}/>
        <Stack.Screen name="Notifications" options={{headerShown: false}}/>
        <Stack.Screen name="UserConversation" options={{headerShown: false}}/>
    </Stack>);
}

export default UserLayout