import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router} from "expo-router";

const Chats = () => {


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
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView style={{flex: 1}}>
                <CustomNavigationHeader text={"Message"} goBackFunction={_handleGoBack} showBackArrow/>
                <ScrollView>

                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    )
        ;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
export default Chats;