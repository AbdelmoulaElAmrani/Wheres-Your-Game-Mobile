import {Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {useCallback, useEffect, useState} from "react";
import CustomButton from "@/components/CustomButton";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import {IResetTokenObj, IUserInfo} from "@/models/IUserInfo";
import {OtpInput} from "react-native-otp-entry";
import {AuthService} from "@/services/AuthService";
import LocalStorageService from "@/services/LocalStorageService";

const FPVerification = () => {
    const [timer, setTimer] = useState(180); // 3 minutes countdown in seconds
    const [code, setCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    //const [sentCode, setSentCode] = useState("");
    const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
    const router = useRouter();
    const paramData = useLocalSearchParams<any>();


    const getMaskedPhone = (phone: string) => {
        if (!phone) return "";
        if (phone.length <= 6) return phone; // If phone number is too short to mask
        return phone.slice(0, 2) + "*****" + phone.slice(-3);
    };

    const sendVerificationCode = async () => {
        if (userInfo) {
            //TODO:: replace this by calling the api to send otp
           const response =  await AuthService.sendOTFG(userInfo.email);
            //const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
            //setSentCode(generatedCode);
            //console.log("Sent verification code:", generatedCode);
        }
    };

    const formatTimer = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    useFocusEffect(
        useCallback(() => {
            if (paramData?.userInfo && userInfo == null) {
                const parsed = JSON.parse(paramData.userInfo) as IUserInfo;
                setUserInfo((prev) => prev || parsed);
            }
        }, [paramData])
    );

    useEffect(() => {
        if (userInfo) {
            sendVerificationCode();
            setTimer(180);
        }
    }, [userInfo]);

    const _handleOnVerify = async () => {
        setErrorMessage("");
        if (code.length == 4 && userInfo != null) {
            console.log("Verifying code:", code, "for user:", userInfo.id);
            const token = await AuthService.verifyOTPFG(code, userInfo.id);
            console.log("Verification response:", token);
            console.log("Token is null:", token === null);
            console.log("Token isValid:", token?.isValid);
            console.log("Token valid:", token?.valid);
            
            if(token != null && (token.isValid === true || token.valid === true)){
                console.log("Verification successful! Reset token:", token.resetToken);
                //TODO:: you need to send the user id and resetToken
                await LocalStorageService.storeItem<IResetTokenObj>('resetToken', {resetToken: token.resetToken, id: userInfo.id});
                router.replace("/FPReset");
            } else {
                console.log("Verification failed. Token:", token);
                setErrorMessage("The code is not correct, try again.");
            }
        }
    }

    const handleResendCode = () => {
        if (timer === 0 && userInfo) {
            sendVerificationCode();
            setTimer(180);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView>
                    <CustomNavigationHeader showBackArrow={false} showSkip={false} showLogo={true}/>
                    <View style={styles.container}>
                        <View style={styles.mainContainer}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Forget Password</Text>
                                <Text style={styles.subTitle}>
                                    We sent a 4 digit code to your number{"\n"}
                                    {userInfo ? `${userInfo.countryCode}${getMaskedPhone(userInfo.phoneNumber)}` : ""}
                                    {"\n"}The code expires in <Text style={{color: 'blue'}}>{formatTimer(timer)}</Text>
                                </Text>
                            </View>
                            <View style={{
                                marginVertical: 20,
                                alignItems: "center",
                                height: '50%',
                                marginTop: hp(10)
                            }}>
                                <OtpInput
                                    numberOfDigits={4}
                                    focusColor={'#2757CB'}
                                    autoFocus={true}
                                    onFilled={(text) => {
                                        Keyboard.dismiss();
                                        setCode(text);
                                    }}
                                    focusStickBlinkingDuration={400}
                                    theme={{
                                        pinCodeContainerStyle: {
                                            width: 58,
                                            height: 58,
                                            borderColor: 'black'
                                        }
                                    }}
                                />
                                {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>}
                                <View style={styles.resendContainer}>
                                    {timer === 0 ? (
                                        <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: .5, borderColor: 'grey'}}>
                                            <Text style={{fontSize: 16, color: 'grey'}}>
                                                Don't receive your code?
                                            </Text>
                                            <TouchableOpacity onPress={handleResendCode}>
                                                <Text style={{color: 'blue', fontSize: 16}}> Resend</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text style={styles.resendText}>Resend Code available
                                            in {formatTimer(timer)}</Text>
                                    )}
                                </View>
                            </View>
                            <CustomButton text={'Verify'} style={code.length !== 4 && {backgroundColor: 'grey'}}
                                          onPress={_handleOnVerify} disabled={code.length !== 4}/>
                        </View>
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
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
        color: 'grey',
        textAlign: 'center'
    },
    errorText: {
        color: "red",
        marginTop: hp(4),
        fontSize: 16
    },
    resendContainer: {
        marginTop: hp(5),
        alignItems: "center",
    },
    resendText: {
        color: "grey",
        fontSize: 16,
    },
});

export default FPVerification;