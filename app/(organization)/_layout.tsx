import {Stack} from "expo-router";

const OrganizationLayout = () => {
    return (<Stack
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="index" options={{headerShown: false}}/>
    </Stack>);
}

export default OrganizationLayout