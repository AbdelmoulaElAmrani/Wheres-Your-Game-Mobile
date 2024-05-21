import { Stack } from "expo-router";

const TeamLayout = () => {
    return (<Stack
        screenOptions={{
            headerShown: false
        }}>
        <Stack.Screen name="TeamForm" options={{ headerShown: false }} />
    </Stack>);
}

export default TeamLayout