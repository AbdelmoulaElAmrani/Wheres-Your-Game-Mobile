import { Stack } from "expo-router";

const UserLayout = () => {
    return (<Stack
        initialRouteName="index"
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" options={{ headerShown: false }} />
    </Stack>);
}

export default UserLayout