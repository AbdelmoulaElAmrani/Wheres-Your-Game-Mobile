import {StyleSheet, View} from "react-native";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {router} from "expo-router";

const Notifications = () => {

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    return (
        <ImageBackground
            style={{
                flex: 1,
                width: '100%',
            }}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={"Notification"} goBackFunction={_handleGoBack} showBackArrow/>
                <View style={{backgroundColor: 'white', height: '100%', width: '100%'}}>

                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Notifications;