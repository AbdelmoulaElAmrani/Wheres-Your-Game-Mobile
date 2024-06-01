import {Stack} from "expo-router";

const UserLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="Chats" options={{headerShown: false}}/>
        <Stack.Screen name="UserConversation" options={{headerShown: false}}/>
    </Stack>);
}

export default UserLayout