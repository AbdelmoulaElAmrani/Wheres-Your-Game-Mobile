import {Alert, StyleSheet, Text, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import CustomButton from "@/components/CustomButton";
import {useRoute} from "@react-navigation/core";
import {useState} from "react";
import {router} from "expo-router";
import {AuthService} from "@/services/AuthService";

const FPReset = () => {
    const _route = useRoute();
    const {id, resetToken} = _route.params as { id: string; resetToken: string };
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const _handleOnResetPassword = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        try {
            // Call backend to update the password.
            const response = await AuthService.resetPasswordFG({id: id, resetToken, newPassword: password});
            if (response?.isValid) {
                Alert.alert("Success", "Your password has been reset.");
                router.replace('/Login');
            } else {
                Alert.alert("Error", "Failed to reset password.");
            }
        } catch (err) {
            Alert.alert("Error", "An error occurred during password reset.");
        }
    };
    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader showBackArrow={true} showSkip={false} showLogo={true}/>
                <View style={styles.container}>
                    <View style={styles.mainContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Forget Password</Text>
                            <Text style={styles.subTitle}>Please enter your new password and
                                confirm password
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
                        <CustomButton text={'Reset Password'} onPress={_handleOnResetPassword} disabled={true}/>
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

export default FPReset;