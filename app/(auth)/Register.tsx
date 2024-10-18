import {StatusBar} from "expo-status-bar";
import {SafeAreaView} from "react-native-safe-area-context";
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    Image, ImageBackground
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import CustomButton from "@/components/CustomButton";
import {TextInput} from "react-native-paper";
import {router} from "expo-router";
import {RegisterRequest} from "@/models/requestObjects/RegisterRequest";
import UserType from "@/models/UserType";
import {useDispatch} from 'react-redux'
import PhoneInput from "react-native-phone-number-input";
import {updateUserRegisterData, logout} from "@/redux/UserSlice";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Helpers} from "@/constants/Helpers";
import {AuthService} from "@/services/AuthService";
import LocalStorageService from "@/services/LocalStorageService";
//import {User} from "@react-native-google-signin/google-signin";


const Register = () => {
    const dispatch = useDispatch()
    const [userData, setUserData] = useState<RegisterRequest>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        countryCode: '+1',
        address: '',
        zipCode: '',
        bio: '',
        verified: false,
        role: UserType.DEFAULT,
    });
    const phoneInput = useRef<PhoneInput>(null);
    const [showPasswordInput, setShowPasswordInput] = useState<boolean>(true);

    useEffect(() => {
        dispatch(logout({}) as any);
        /* LocalStorageService.getItem<User>('googleUser').then((userInfo) => {
             if (userInfo) {
                 setShowPasswordInput(false);
                 setUserData({
                     email: userInfo.user.email,
                     password: '',
                     firstName: userInfo.user.givenName || '',
                     lastName: userInfo.user.familyName || '',
                     phoneNumber: '',
                     countryCode: '+1',
                     address: '',
                     zipCode: '',
                     bio: '',
                     verified: false,
                     role: UserType.DEFAULT,
                 });
             }
         }).catch((e) => {
             console.log(e);
         })
             .finally(() => {
                 LocalStorageService.removeItem('googleUser');
             });*/
    }, []);


    const _handleOnNext = async (): Promise<void> => {
        const errors = await _verifyRequiredData(userData);
        if (errors.length === 0) {
            dispatch(updateUserRegisterData(userData))
            router.navigate("/TermsPolicies");
        } else {
            Alert.alert(errors.join('\n'));
        }
    }

    const _verifyRequiredData = async (userData: RegisterRequest): Promise<string[]> => {
        const errors: string[] = [];

        if (userData.email.trim() === '') {
            errors.push('Email is required');
        } else if (!Helpers._isEmailValid(userData.email)) {
            errors.push('Invalid email format');
        }
        try {
            const result = await AuthService.verifyEmail(userData.email.trim());
            if (result || result == undefined) errors.push('The Email already taken');
        } catch (e) {
            console.error(e);
        }
        if (showPasswordInput) {
            if (userData.password.trim() === '') {
                errors.push('Password is required');
            } else if (!Helpers._isPasswordValid(userData.password)) {
                errors.push('Password must be at least 6 characters long and include at least one uppercase letter.');
            }
        }
        if (userData.firstName.trim() === '') {
            errors.push('First name is required');
        }

        if (userData.lastName.trim() === '') {
            errors.push('Last name is required');
        }

        if (userData.phoneNumber.trim() === '') {
            errors.push('Phone number is required');
        } else if (phoneInput.current?.isValidNumber(userData.phoneNumber) === false) {
            errors.push('Invalid phone number');
        }
        return errors;
    }

    return (<ImageBackground
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            flex: 1,
            alignItems: "center"
        }}
        source={require('../../assets/images/signupBackGround.jpg')}
    >
        <StatusBar style="light"/>
        <SafeAreaView style={{height: hp(100)}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Image style={styles.logoContainer}
                               source={require('../../assets/images/logoBall.png')}/>
                    </View>
                    <Text style={styles.headerTitle}>Sports For Every Age</Text>
                    <KeyboardAwareScrollView style={{flex: 1}}>
                        <View style={styles.formContainer}>
                            <View>
                                <Text style={styles.textLabel}>First Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'First name'}
                                    placeholderTextColor={'grey'}
                                    value={userData.firstName}
                                    onChangeText={(value) => {
                                        setUserData(oldValue => ({...oldValue, firstName: value}))
                                    }}
                                />
                            </View>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Last Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Last name'}
                                    placeholderTextColor={'grey'}
                                    value={userData.lastName}
                                    onChangeText={(value) => {
                                        setUserData(oldValue => ({...oldValue, lastName: value}))
                                    }}
                                />
                            </View>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Email</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Email'}
                                    placeholderTextColor={'grey'}
                                    value={userData.email}
                                    onChangeText={(value) => {
                                        setUserData(oldValue => ({...oldValue, email: value}))
                                    }}
                                />
                            </View>
                            {showPasswordInput && (
                                <View style={styles.mgTop}>
                                    <Text style={styles.textLabel}>Password</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Password'}
                                        secureTextEntry={true}
                                        placeholderTextColor={'grey'}
                                        value={userData.password}
                                        onChangeText={(value) => {
                                            setUserData(oldValue => ({...oldValue, password: value}))
                                        }}
                                    />
                                </View>
                            )}
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Phone number</Text>
                                <PhoneInput
                                    ref={phoneInput}
                                    defaultCode="US"
                                    layout="first"
                                    withDarkTheme
                                    placeholder="Phone number"
                                    value={userData.phoneNumber}
                                    onChangeText={(text) => setUserData(oldValue => ({
                                        ...oldValue,
                                        phoneNumber: Helpers._sanitizePhoneNumber(text)
                                    }))}
                                    containerStyle={styles.inputStyle}
                                    textContainerStyle={styles.textPhoneInputContainer}
                                    onChangeCountry={(country) => setUserData(oldValue => (
                                        {...oldValue, countryCode: country.callingCode[0]}
                                    ))}
                                    codeTextStyle={styles.phoneCodeTextStyle}
                                    textInputStyle={styles.phoneInputTextStyle}
                                />

                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                    <View style={styles.nextBottom}>
                        <Image
                            source={require('../../assets/images/groupPeople.png')}/>
                        <CustomButton
                            text={"Next"} onPress={_handleOnNext}/>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    </ImageBackground>);
}

const styles = StyleSheet.create({
    container: {
        height: hp(100),
        flex: 1
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        resizeMode: 'contain',
        height: 200,
        marginTop: -40
    },
    headerTitle: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: -40,
        letterSpacing: 5
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, .3)',
        alignSelf: "center",
        width: wp(90),
        borderRadius: 20,
        padding: 20,
        marginTop: 30,
    }
    ,
    textLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: "500"
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 50,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20
    },
    mgTop: {
        marginTop: 5
    },
    selectBox: {
        flex: 1,
        marginRight: 10,
        backgroundColor: 'white'
    },
    dropdownStyle: {
        backgroundColor: 'white'
    },
    flagIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    nextBottom: {
        alignItems: 'center'
    },
    selectedFlagContainer: {
        backgroundColor: 'white',
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        borderRadius: 10,
        marginRight: 5,
        height: 45,
    },
    textPhoneInputContainer: {
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        backgroundColor: 'white',
        height: 50,
    },
    phoneCodeTextStyle: {
        color: 'grey',
        fontSize: 17,
    },
    phoneInputTextStyle: {
        color: 'grey',
        fontSize: 17,
        height: 50,
        marginTop: 4

    }
});
export default Register;