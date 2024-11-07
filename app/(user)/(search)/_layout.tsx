import {Stack} from "expo-router";

const UserLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="SearchUser" options={{headerShown: false}}/>
        <Stack.Screen name="SearchGlobal" options={{headerShown: false}}/>
    </Stack>);
}

export default UserLayout