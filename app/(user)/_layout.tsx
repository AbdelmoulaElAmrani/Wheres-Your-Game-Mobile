import {Stack} from "expo-router";

const AuthLayout = () => {
    return (<Stack
        screenOptions={{
        headerShown: false
    }}>
        <Stack.Screen name="EditProfile" options={{headerShown: false}}/>
        <Stack.Screen name="SportIntressed" options={{headerShown: false}}/>
    </Stack>);
}

export default AuthLayout