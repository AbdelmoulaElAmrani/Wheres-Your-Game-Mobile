import {Stack} from "expo-router";

const PrivacySettingsLayout = () => {
    return (<Stack
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="AccountSettings" options={{headerShown: false}}/>
    </Stack>);
}

export default PrivacySettingsLayout