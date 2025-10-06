import { Stack } from "expo-router";

const AuthLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="(forget)" options={{headerShown: false}}/>
        <Stack.Screen name="Register" options={{ 
            headerShown: false,
            gestureEnabled: false
        }} />
        <Stack.Screen name="TermsPolicies" options={{ headerShown: false }} />
        <Stack.Screen name="UserStepForm" options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" options={{ headerShown: false }} />
    </Stack>);
}

export default AuthLayout