import FontAwesome from '@expo/vector-icons/FontAwesome';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';

import {useColorScheme} from '@/components/useColorScheme';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'mon-r': require('../assets/fonts/Montserrat-Regular.ttf'),
        'mon-b': require('../assets/fonts/Montserrat-Bold.ttf'),
        'mon-b-it': require('../assets/fonts/Montserrat-BoldItalic.ttf'),
        'mon-extra-b': require('../assets/fonts/Montserrat-ExtraBold.ttf'),
        'mon-extra-l': require('../assets/fonts/Montserrat-ExtraLight.ttf'),
        'mon-extra-l-it': require('../assets/fonts/Montserrat-ExtraLightItalic.ttf'),
        'mon-it': require('../assets/fonts/Montserrat-Italic.ttf'),
        'mon-l': require('../assets/fonts/Montserrat-Light.ttf'),
        'mon-m': require('../assets/fonts/Montserrat-Medium.ttf'),
        'mon-semi-b': require('../assets/fonts/Montserrat-SemiBold.ttf'),
        'mon-thin': require('../assets/fonts/Montserrat-Thin.ttf'),
        //...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav/>;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        /*
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        */
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        </Stack>
        /* </ThemeProvider>*/
    );
}