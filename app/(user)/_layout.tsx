import { Stack } from "expo-router";

const UserLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="SportIntressed" options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" options={{ headerShown: false }} />
    </Stack>);
}

export default UserLayout