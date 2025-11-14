import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, {useEffect} from 'react';

import {SafeAreaProvider} from "react-native-safe-area-context";
import {Provider} from 'react-redux';
import {persistor, store} from '@/redux/ReduxConfig';
import {PersistGate} from 'redux-persist/integration/react';
import {I18nManager, Platform} from 'react-native';
import {LogBox} from 'react-native';
import {injectStoreIntoAxios} from "@/services/Requests";
import {GOOGLE_ADS_APP_ID_ANDROID, GOOGLE_ADS_APP_ID_IOS} from '@/appConfig';

// Try to import mobileAds, but handle case where native module isn't available
let mobileAds: any = null;
try {
  mobileAds = require('react-native-google-mobile-ads').default;
} catch (error) {
  console.log('Google Mobile Ads native module not available. Ads will show placeholder only.');
}


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
        LogBox.ignoreLogs([
            'Require cycle:',
            'Push notifications require a physical device to work properly'
        ]);

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
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
    injectStoreIntoAxios(store);
    
    // Initialize Google Mobile Ads (only if native module is available)
    useEffect(() => {
        if (!mobileAds) {
            console.log('Google Mobile Ads native module not available. Skipping initialization.');
            return;
        }
        
        const initializeAds = async () => {
            try {
                const appId = Platform.OS === 'ios' 
                    ? GOOGLE_ADS_APP_ID_IOS
                    : GOOGLE_ADS_APP_ID_ANDROID;
                
                if (!appId) {
                    console.log('Google Mobile Ads App ID not configured for this platform');
                    return;
                }
                
                await mobileAds().initialize();
                console.log('Google Mobile Ads initialized with App ID:', appId);
            } catch (error) {
                console.error('Error initializing Google Mobile Ads:', error);
            }
        };
        
        initializeAds();
    }, []);
    
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <Stack
                        screenOptions={{
                            gestureEnabled: false,
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                        <Stack.Screen name="(tabs)" options={{
                            headerShown: false,
                            gestureEnabled: false,
                            gestureDirection: 'horizontal',
                        }}/>
                        <Stack.Screen name="(user)" options={{headerShown: false}}/>
                        <Stack.Screen name="(map)" options={{headerShown: false}}/>
                        <Stack.Screen name="(team)" options={{headerShown: false}}/>
                        <Stack.Screen name="(settings)" options={{headerShown: false}}/>
                    </Stack>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}