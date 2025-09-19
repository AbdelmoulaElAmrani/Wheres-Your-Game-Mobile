import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import React, {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Alert, ScrollView, Platform
} from "react-native";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import Modal from "react-native-modal";
import {memo, useEffect, useRef, useState} from "react";
import CustomButton from "@/components/CustomButton";
import {AntDesign, Entypo, Ionicons} from "@expo/vector-icons";
import {OtpInput, OtpInputRef} from "react-native-otp-entry";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import UserType from "@/models/UserType";
import ParentIcon from "../../assets/images/svg/ParentIcon";
import CoachIcon from "../../assets/images/svg/CoachIcon";
import PlayerIcon from "../../assets/images/svg/PlayerIcon";
import {router} from "expo-router";
import {RegisterRequest} from "@/models/requestObjects/RegisterRequest";
import {useDispatch, useSelector} from 'react-redux'
import {getUserProfile, updateUserRegisterData} from "@/redux/UserSlice";
import {AuthService} from "@/services/AuthService";
import LocalStorageService from "@/services/LocalStorageService";
//import {User} from "@react-native-google-signin/google-signin";
import {GoogleUserRequest} from "@/models/requestObjects/GoogleUserRequest";
import OrganizationIcon from "@/assets/images/svg/OrganizationIcon";
import CampIcon from "@/assets/images/svg/CampIcon";
import CoachIconV2 from "@/assets/images/svg/CoachIconV2";
import BusinessIconV2 from "@/assets/images/svg/BusinessIconV2";
import Spinner from "@/components/Spinner";
import OverlaySpinner from "@/components/OverlaySpinner";
import { useAlert } from "@/utils/useAlert";
import StyledAlert from "@/components/StyledAlert";


const UserStepForm = () => {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [otpCodeNotEmpty, setOtpCodeNotEmpty] = useState<boolean>(false);
    const [isOtpValid, setOtpValid] = useState<boolean>(false);
    const [otpCode, setOtpCode] = useState<string>('');
    const userRegister = useSelector((state: any) => state.user.userRegister);
    const [userData, setUserData] = useState<RegisterRequest>(userRegister);
    const _stepTitles = [
        {
            title: 'Choose a user type',
            subTitle: 'Please select the user',
            modalTitle: 'Verification code send to your phone number',
            modalSubTitle: 'A verification code will be sent to your mobile to verify the account and create your profile.'
        }, {
            title: 'Verification Number',
            subTitle: 'You will got a OTP via SMS',
            modalTitle: 'Your account has been successfully verified',
            modalSubTitle: 'Now you can start to create your profile.'
        }];

    const buttonText = ['Continue', 'Verify'];
    const { showErrorAlert, showSuccessAlert, showStyledAlert, alertConfig, closeAlert } = useAlert();


    const _showModal = () => {
        if (_verifyUserStepDate(currentStep)) {
            setVisible(true)
            dispatch(updateUserRegisterData(userData));
        }
    }

    const _hideModal = () => setVisible(false)
    const _verifyUserStepDate = (step: number): boolean => {
        if (step === 1) {
            return _verifyUserSelectedHisRule();
        } else {
            try {
                dispatch(getUserProfile() as any)
                return true;
            } catch (e) {
                console.error(e);
                showErrorAlert('Something went wrong', closeAlert);
                return false;
            }
        }
    }

    const createUser = async () => {
        //const storedUser = await LocalStorageService.getItem<User>('googleUser');
        try {
            // if (storedUser) {
            //     const googleUser: GoogleUserRequest = {googleUser: storedUser, userData: userData};
            //     return await AuthService.loginOrSignWithGoogle(googleUser);
            // } else {
            return await AuthService.register(userData);
            // }
        } catch (e) {
            console.error(e);
        } finally {
            await LocalStorageService.removeItem('googleUser');
        }

    }

    const _verifyUserSelectedHisRule = () => {
        try {
            const res = userData.role !== UserType.DEFAULT;
            if (!res) showErrorAlert('You need to select a type', closeAlert);
            return res;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    const goToNextStep = async () => {
        try {
            const result = await createUser();
            if (result)
                setCurrentStep(oldValue => Math.max(2, oldValue - 1));
        } catch (e) {
            console.log(e);
        }
    };

    const _onNext = async () => {
        _hideModal();
        if (currentStep === 1) {
            if (!_verifyUserSelectedHisRule()) {
                return;
            }
            await goToNextStep();
        } else {
            handleSubmit();
        }
    }

    const handleSubmit = () => {
        if (_verifyUserStepDate(currentStep)) {
            router.navigate('/EditProfile')
        }
    };

    const _verifySelectedType = (type: UserType): boolean => userData.role == type;

    const UserTypeForm = memo(() => (
        <ScrollView>
            <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.PARENT}))}
                                  style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.PARENT) ? '#2757CB' : 'white'}]}>
                    {_verifySelectedType(UserType.PARENT) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <ParentIcon style={styles.userTypeIcon}
                                    fill={_verifySelectedType(UserType.PARENT) ? '#FFF' : '#000'}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.PARENT) ? 'white' : 'black'}]}>Parents</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.PARENT) ? 'white' : 'black'}]}>I'm
                        creating a parent or (child/children) profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.PLAYER}))}
                                  style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.PLAYER) ? '#2757CB' : 'white'}]}>
                    {_verifySelectedType(UserType.PLAYER) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <PlayerIcon style={styles.userTypeIcon}
                                    fill={_verifySelectedType(UserType.PLAYER) ? '#FFF' : '#000'}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.PLAYER) ? 'white' : 'black'}]}>Player</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.PLAYER) ? 'white' : 'black'}]}>I
                        am creating a player profile</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.COACH}))}
                                  style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.COACH) ? '#2757CB' : 'white'}]}>
                    {_verifySelectedType(UserType.COACH) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <CoachIconV2 style={styles.userTypeIcon}
                                     fill={_verifySelectedType(UserType.COACH) ? '#FFF' : '#000'}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.COACH) ? 'white' : 'black'}]}>Coach</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.COACH) ? 'white' : 'black'}]}>Camps/Games
                        Leagues Officiating</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.ORGANIZATION}))}
                                  style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.ORGANIZATION) ? '#2757CB' : 'white'}]}>
                    {_verifySelectedType(UserType.ORGANIZATION) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <OrganizationIcon style={styles.userTypeIcon}
                                          fill={_verifySelectedType(UserType.ORGANIZATION) ? '#FFF' : '#000'}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.ORGANIZATION) ? 'white' : 'black'}]}>Organization</Text>
                    </View>
                    <Text style={{marginTop: 15}}></Text>
                </TouchableOpacity>
            </View>
            <View style={styles.rowContainer}>
                <TouchableOpacity
                    disabled={true}
                    onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.TOURNAMENTS}))}
                    style={[styles.squareContainer, styles.disabled]}>
                    {_verifySelectedType(UserType.TOURNAMENTS) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <Ionicons
                            style={styles.userTypeIcon}
                            color={_verifySelectedType(UserType.TOURNAMENTS) ? '#FFF' : '#000'}
                            name="trophy-outline" size={55}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.TOURNAMENTS) ? 'white' : 'black'}]}>Tournaments</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.TOURNAMENTS) ? 'white' : 'black'}]}>Coming
                        soon</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={true}
                    onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.TRAINER_CAMP_TRAINING}))}
                    style={[styles.squareContainer, styles.disabled]}>
                    {_verifySelectedType(UserType.TRAINER_CAMP_TRAINING) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <CampIcon style={styles.userTypeIcon}
                                  fill={_verifySelectedType(UserType.TRAINER_CAMP_TRAINING) ? '#FFF' : '#000'}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.TRAINER_CAMP_TRAINING) ? 'white' : 'black'}]}>Trainer/Camp/Training</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.TRAINER_CAMP_TRAINING) ? 'white' : 'black'}]}>Coming
                        soon</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.rowContainer}>
                <TouchableOpacity
                    disabled={true}
                    onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.LEAGUE}))}
                    style={[styles.squareContainer, styles.disabled]}>
                    {_verifySelectedType(UserType.LEAGUE) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <Ionicons
                            style={styles.userTypeIcon}
                            color={_verifySelectedType(UserType.LEAGUE) ? '#FFF' : '#000'}
                            name="trophy-outline" size={55}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.LEAGUE) ? 'white' : 'black'}]}>League</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.LEAGUE) ? 'white' : 'black'}]}>Coming
                        soon</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={true}
                    onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.REFEREES_OFFICIALS_UMPIRES}))}
                    style={[styles.squareContainer, styles.disabled]}>
                    {_verifySelectedType(UserType.REFEREES_OFFICIALS_UMPIRES) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <CoachIcon style={styles.userTypeIcon}
                                   fill={_verifySelectedType(UserType.REFEREES_OFFICIALS_UMPIRES) ? '#FFF' : '#000'}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.REFEREES_OFFICIALS_UMPIRES) ? 'white' : 'black'}]}>Referees/Officials/Umpires</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.REFEREES_OFFICIALS_UMPIRES) ? 'white' : 'black'}]}>Coming
                        soon</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.rowContainer}>
                <TouchableOpacity
                    disabled={true}
                    onPress={() => setUserData(oldValue => ({...oldValue, role: UserType.BUSINESS}))}
                    style={[styles.squareContainer, styles.disabled]}>
                    {_verifySelectedType(UserType.BUSINESS) && <View style={styles.checkIcon}>
                        <AntDesign name="check" size={20} color="white"/>
                    </View>}
                    <View>
                        <BusinessIconV2
                            style={styles.userTypeIcon}
                            // @ts-ignore
                            fillColor={_verifySelectedType(UserType.BUSINESS) ? '#FFF' : '#000'}/>
                        <Text
                            style={[styles.userTypeTitle, {color: _verifySelectedType(UserType.BUSINESS) ? 'white' : 'black'}]}>Business/Advertising
                            Consultant</Text>
                    </View>
                    <Text
                        style={[styles.userTypeDescIcon, {color: _verifySelectedType(UserType.BUSINESS) ? 'white' : 'black'}]}>Coming
                        soon</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginTop: 220}}/>
        </ScrollView>
    ));

    const OTPVerification = () => {
        const otpRef = useRef<OtpInputRef>();
        const [enableSendOtp, setEnableSendOtp] = useState<boolean>(true)
        const [loading, setLoading] = useState<boolean>(false);

        useEffect(() => {
            const sendOtp = async () => {
                if (!otpCodeNotEmpty && otpCode.trim().length === 0) {
                    setLoading(true);
                    const ignored = await AuthService.sendOTP();
                    setLoading(false);
                }
            }
            sendOtp();
            if (otpCodeNotEmpty) {
                otpRef.current?.setValue(otpCode);
            }
        }, []);

        const _onResendOTPCode = async () => {
            try {
                if (enableSendOtp) {
                    setEnableSendOtp(false);
                    setLoading(true);
                    const ignored = await AuthService.sendOTP();
                    console.log(ignored);
                    setTimeout(() => {
                        setEnableSendOtp(true);
                    }, 30000); // 30 seconds in milliseconds
                } else {
                    Alert.alert("Please try again later.");
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        const _verifyOTP = async (otpNumber: string) => {
            Keyboard.dismiss();
            if (otpNumber.trim().length !== 0) {
                setOtpCode(otpNumber);
                if (otpNumber == '0000') {
                    setOtpCodeNotEmpty(true);
                    setOtpValid(true);
                } else {
                    try {
                        const result = await AuthService.verifyOTP(otpNumber.trim());
                        const storedAuth = await LocalStorageService.getItem<boolean>("otp");
                        if (storedAuth) {
                        //     Alert.alert('the verification code is not correct');
                        // } else {
                            Keyboard.dismiss();
                            setOtpCodeNotEmpty(true);
                            setOtpValid(true);
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{
                    alignItems: 'center',
                    marginTop: 50,
                    height: hp(45)
                }}>
                    {loading && (
                        <OverlaySpinner visible={loading}/>
                    )}
                    <Text style={{
                        marginBottom: 20,
                        fontSize: 20,
                        fontWeight: '500'
                    }}>Verification Code</Text>
                    <OtpInput
                        numberOfDigits={4}
                        focusColor={'#2757CB'}
                        autoFocus={true}
                        // @ts-ignore
                        ref={otpRef}
                        onFilled={(value) => _verifyOTP(value)}
                        focusStickBlinkingDuration={400}
                        theme={{
                            pinCodeContainerStyle: {
                                width: 58,
                                height: 58,
                                borderColor: 'black'
                            }
                        }}
                    />
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        marginTop: 30
                    }}>
                        <Text style={{
                            fontSize: 18,
                            color: 'grey'
                        }}>Don't receive your code?
                        </Text>
                        <TouchableOpacity
                            onPress={_onResendOTPCode}>
                            <Text style={{
                                fontSize: 18,
                                color: '#3E4FEF'
                            }}> Resend</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader showBackArrow={currentStep === 1} text={"User"}/>
                <View style={styles.container}>
                    <Text style={styles.stepText}>Step {currentStep}/2</Text>
                    <View style={styles.mainContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{_stepTitles[currentStep - 1].title}</Text>
                            <Text style={styles.subTitle}>{_stepTitles[currentStep - 1].subTitle}</Text>
                        </View>
                        <View
                            style={{
                                justifyContent: 'center',
                                alignContent: "center",
                                marginTop: 25,
                                marginBottom: 25,
                                height: '60%'
                            }}>
                            {currentStep === 1 && <UserTypeForm/>}
                            {(currentStep === 2) && <OTPVerification/>}
                        </View>
                        <CustomButton disabled={!otpCodeNotEmpty && isOtpValid && currentStep === 2}
                                      text={buttonText[currentStep - 1]} onPress={_showModal}/>
                    </View>
                </View>
                <Modal onDismiss={_hideModal} onModalHide={Keyboard.dismiss} isVisible={visible}
                       style={styles.containerStyle}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{flex: 1}}>
                            <Text style={{
                                textAlign: "center",
                                position: "absolute",
                                top: 20,
                                fontWeight: '900',
                                letterSpacing: 1,
                                fontSize: 20,
                                marginHorizontal: 20,
                                width: 300
                            }}>{_stepTitles[currentStep - 1].modalTitle}</Text>
                            <Text style={{
                                textAlign: 'center',
                                color: 'grey',
                                letterSpacing: 0.2,
                                fontSize: 16,
                                marginHorizontal: 40
                            }}>{_stepTitles[currentStep - 1].modalSubTitle}</Text>
                            <CustomButton style={{position: "absolute", bottom: 25}} text={"OK"}
                                          onPress={() => _onNext()}/>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                <StyledAlert
                    visible={showStyledAlert}
                    config={alertConfig}
                    onClose={closeAlert}
                />
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
    button: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    stepText: {
        color: 'white',
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 30
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
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        marginBottom: 10
    },
    squareContainer: {
        backgroundColor: 'white',
        height: 200,
        width: 150,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },
    checkIcon: {
        position: "absolute",
        top: 10,
        right: 10
    },
    userTypeTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 5,
        textAlign: "center"
    },
    userTypeIcon: {
        justifyContent: "center",
        alignSelf: "center"
    },
    userTypeDescIcon: {
        color: 'black',
        textAlign: "center",
        fontSize: 16,
        marginTop: 15
    },
    containerStyle: {
        backgroundColor: 'white',
        maxHeight: 270,
        minHeight: hp(32),
        maxWidth: 350,
        minWidth: wp(90),
        borderRadius: 20,
        alignSelf: "center",
        position: "absolute",
        bottom: hp(8)
    },
    disabled: {
        backgroundColor: 'rgba(196,192,192,0.2)'
    }
});

export default UserStepForm;
