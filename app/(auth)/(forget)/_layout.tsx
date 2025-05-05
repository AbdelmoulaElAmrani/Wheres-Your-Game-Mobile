import {Stack} from "expo-router";

const PasswordLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="FPVerification" options={{headerShown: false}}/>
        <Stack.Screen name="FPReset" options={{headerShown: false}}/>
    </Stack>);
}

export default PasswordLayout