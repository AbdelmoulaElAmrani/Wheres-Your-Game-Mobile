import {StyleSheet} from "react-native";
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
            <SafeAreaView style={{flex: 1}}>
                <CustomNavigationHeader text={"Notification"} goBackFunction={_handleGoBack} showBackArrow/>

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