import {Stack} from "expo-router";

const SettingsLayout = () => {
    return (<Stack
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="(privacySettings)" options={{headerShown: false}}/>
        <Stack.Screen name="ProfilePreference" options={{headerShown: false}}/>
    </Stack>);
}

export default SettingsLayout