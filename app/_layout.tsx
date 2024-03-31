import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from 'react-redux';
import { persistor, store } from '@/redux/ReduxConfig';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nManager } from 'react-native';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(auth)',
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

    return <RootLayoutNav />;
}



function RootLayoutNav() {
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
    return (
        <Provider store={store}>
             <PersistGate loading={null} persistor={persistor}>

        <SafeAreaProvider >
            <Stack>
                <Stack.Screen name="(user)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaProvider >
        </PersistGate>
        </Provider>
    );
}