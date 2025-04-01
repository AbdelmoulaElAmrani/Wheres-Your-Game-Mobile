import {StyleSheet, Text, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {useState} from "react";
import CustomButton from "@/components/CustomButton";
import {useRoute} from "@react-navigation/core";

const FPVerification = () => {
    const [timer, setTimer] = useState();
    const _route = useRoute();
    const {userEmail} = _route.params as { userEmail: string };
    const [code, setCode] = useState("");

    const _handleOnVerify = () => {

    }

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader showBackArrow={false} showSkip={false} showLogo={true}/>
                <View style={styles.container}>
                    <View style={styles.mainContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Forget Password</Text>
                            <Text style={styles.subTitle}>We sent 4 digit code to your email.
                                The code is expired in <Text>timer</Text>
                            </Text>
                        </View>
                        <View style={{
                            justifyContent: 'center',
                            alignContent: "center",
                            marginTop: 25,
                            marginBottom: 25,
                            height: '60%'
                        }}>

                        </View>
                        <CustomButton text={'Verify'} onPress={_handleOnVerify} disabled={true}/>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: wp('100'),
        minHeight: hp('100'),
    },
    mainContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopEndRadius: 35,
        borderTopStartRadius: 35,
        paddingTop: 30,
        padding: 20,
        marginTop: 10
    },
    titleContainer: {
        alignSelf: "center",
        alignItems: "center"
    },
    title: {
        fontWeight: "bold",
        fontSize: 25
    },
    subTitle: {
        fontSize: 16,
        color: 'grey'
    },
});

export default FPVerification;