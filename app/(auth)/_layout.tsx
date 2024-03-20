import {Stack} from "expo-router";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";

const AuthLayout = () => {
    return (<Stack initialRouteName={'UserStepForm'}
        screenOptions={{
        headerShown: false
    }}>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="Login" options={{headerShown: false}}/>
        <Stack.Screen name="Register" options={{headerShown: false}}/>
        <Stack.Screen name="TermsPolicies" options={{headerShown: false}}/>
        <Stack.Screen name="UserStepForm" options={{headerShown: false}}/>
    </Stack>);
}

export default AuthLayout