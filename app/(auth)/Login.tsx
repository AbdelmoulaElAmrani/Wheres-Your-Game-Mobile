import React, {useEffect, useState} from 'react';
import {
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Image, ImageBackground} from "expo-image";
import {SafeAreaView} from 'react-native-safe-area-context';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {TextInput} from "react-native-paper";
import {AntDesign} from '@expo/vector-icons';
import CustomButton from '@/components/CustomButton';
import {Divider} from "react-native-paper";
import {router} from "expo-router";
import {AuthService} from '@/services/AuthService';
import {useDispatch, useSelector} from 'react-redux';
import {getUserProfile, logout} from '@/redux/UserSlice';
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {persistor} from "@/redux/ReduxConfig";
import Spinner from '@/components/Spinner';
/*import {
    ConfigureParams,
    GoogleSignin,
    User,
} from "@react-native-google-signin/google-signin";*/
import LocalStorageService from '@/services/LocalStorageService';
//import {GoogleUserRequest} from "@/models/requestObjects/GoogleUserRequest";
import {googleAndroidClientId, googleIosClientId, googleWebClientId} from "@/appConfig";
import TokenManager from "@/services/TokenManager";
import OverlaySpinner from '@/components/OverlaySpinner';


const Login = () => {

    const dispatch = useDispatch();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessages, setErrorMessages] = useState<string>('');
    const user = useSelector((state: any) => state.user.userData) as UserResponse;
    const [loading, setLoading] = useState<boolean>(false);

    /* const configureGoogleSignIn = () => {
         GoogleSignin.configure({
             webClientId: googleWebClientId,
             iosClientId: googleIosClientId,
             androidClientId: googleAndroidClientId,
         } as ConfigureParams);
     };*/


    useEffect(() => {
        const fetchData = async () => {
            await LocalStorageService.removeItem("otp");
            const token = await TokenManager.getAccessToken();
            if (token && user?.id) {
                router.replace("/(tabs)");
            } else {
                dispatch(logout({}))
                await persistor.purge();
                await persistor.flush();
            }
        }
        fetchData();
        //configureGoogleSignIn();
    }, [user]);

    /*const _handleSignInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo: User = await GoogleSignin.signIn();
            setLoading(true);
            const checkEmail = await AuthService.verifyEmail(userInfo.user.email);
            if (checkEmail) {
                const body: GoogleUserRequest = {googleUser: userInfo, userData: undefined};
                const data = await AuthService.loginOrSignWithGoogle(body);
                if (!data)
                    throw new Error('Invalid login credentials');
                dispatch(getUserProfile() as any)
                setLoading(false);
                router.replace('/Welcome');
            } else {
                await LocalStorageService.storeItem('googleUser', userInfo);
                setLoading(false);
                router.replace('/Register');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessages('Something went wrong');
            setTimeout(() => {
                setErrorMessages('');
            }, 5000);
            setLoading(false);
        }
    }*/

    const _handleLogin = async () => {
        if (_isLoginFormNotValid()) {
            setErrorMessages('Please enter email and password');
            setTimeout(() => {
                setErrorMessages('');
            }, 5000);
            return;
        }

        try {
            setLoading(true);
            const data = await AuthService.logIn({email, password});
            if (!data) {
                throw new Error('Invalid login credentials');
            }
            dispatch(getUserProfile() as any)
            setLoading(false);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessages('Password or email not correct');
            setTimeout(() => {
                setErrorMessages('');
            }, 5000);
            setLoading(false);
        }
    }


    const _handleForgotPassword = () => {
        router.navigate('/(forget)')
    }

    const _handleSignUp = () => {
        router.replace('/Register');
    }

    const _isLoginFormNotValid = (): boolean => (email.trim() === '' || password.trim() === '') && !loading;

    return (
        <>
            <StatusBar style="light"/>
            <ImageBackground
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
                {/* Card Component */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <SafeAreaView style={styles.container}>

                        <View style={styles.cardContainer}>
                            {loading && (
                                <OverlaySpinner visible={loading}/>
                            )}

                            <View style={styles.headerContainer}>
                                <Image style={styles.logoContainer}
                                       source={require('../../assets/images/logoBall.png')}/>
                            </View>
                            <View style={styles.formContainer}>
                                <View>
                                    <Text style={styles.textLabel}>User Name</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Email'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        left={
                                            <View style={styles.iconContainer}>
                                                <AntDesign name="user" size={20} color="#D3D3D3" />
                                            </View>
                                        }
                                        value={email}
                                        onChangeText={setEmail}
                                        underlineColor={"transparent"}
                                    />
                                </View>
                                <View style={styles.mgTop}>
                                    <Text style={styles.textLabel}>Password</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Password'}
                                        placeholderTextColor={'grey'}
                                        secureTextEntry={true}
                                        left={
                                            <View style={styles.iconContainer}>
                                                <AntDesign name="lock" size={20} color="#D3D3D3" />
                                            </View>
                                        }
                                        value={password}
                                        onChangeText={setPassword}
                                        underlineColor={"transparent"}
                                    />
                                </View>
                                {(errorMessages.trim() !== '') &&
                                    <Text style={{
                                        color: 'red',
                                        textAlign: 'center',
                                        fontSize: 16,
                                        marginTop: 10,
                                        fontWeight: "400"
                                    }}>{errorMessages}</Text>
                                }
                                <View style={styles.mgTop}>
                                    <CustomButton text="Login" onPress={_handleLogin}
                                                  disabled={_isLoginFormNotValid()}/>
                                </View>
                                {/* forgot password ? */}
                                <View style={styles.mgTop}>
                                    <TouchableOpacity onPress={_handleForgotPassword}>
                                        <Text style={{color: 'blue', textAlign: 'center', fontSize: 18}}>Forgot Password
                                            ?</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Sign in with */}
                                {/*<View style={styles.dividerContainerSignUp}>
                                    <Divider style={styles.dividerStyle}/>
                                    <Text style={styles.signInTextStyle}>Sign in with</Text>
                                    <Divider style={styles.dividerStyle}/>
                                </View>*/}

                                {/* Social Media Icons */}
                                {/*<View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 30}}>
                                    <TouchableOpacity disabled={true}>
                                        <FontAwesome5 name="facebook" size={40} color="grey"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={_handleSignInWithGoogle}>
                                        <AntDesign name="google" size={40} color="blue"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={true}>
                                        <AntDesign name="twitter" size={40} color="grey"/>
                                    </TouchableOpacity>
                                </View>*/}
                                <View style={{marginTop: 100}}/>
                                <View style={styles.dontHaveAccountText}>
                                    <Text style={{color: 'black', textAlign: 'center', fontSize: 16}}>Don't have an
                                        account ?
                                    </Text>
                                    <TouchableOpacity onPress={_handleSignUp}>
                                        <Text style={{color: 'blue', textAlign: 'center', fontSize: 16}}> Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </ImageBackground>
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: wp('60'),
        minHeight: hp('100'),
    },
    headerContainer: {
        alignItems: 'center',
        //marginTop: hp(5),
    },
    logoContainer: {
        width: wp(85),
        height: 190,
        marginTop: hp(-32),
    },
    headerTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: hp(5),
    },
    formContainer: {
        alignSelf: "center",
        width: wp(100),
        borderRadius: 30,
        padding: 20,
        marginTop: hp(-10)
    },
    textLabel: {
        color: 'black',
        fontSize: 18,
        fontWeight: "500",
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    mgTop: {
        marginTop: 20,
    },
    cardContainer: {
        width: wp('100'),
        height: hp('90'),
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(16),
    },
    loginButton: {
        backgroundColor: '#007BFF',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    loginText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainerSignUp: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    dividerStyle: {
        height: 2,
        width: 100,
        backgroundColor: '#D3D3D3',

    },
    signInTextStyle: {
        fontSize: 18,
        marginHorizontal: 20
    },
    dontHaveAccountText: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(10)
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
});

export default Login;
