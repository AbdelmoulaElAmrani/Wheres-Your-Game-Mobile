import {useEffect, useState} from 'react';
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
import {FontAwesome5} from '@expo/vector-icons';
import {router} from "expo-router";
import {AuthService} from '@/services/AuthService';
import {useDispatch, useSelector} from 'react-redux';
import {getUserProfile, logout} from '@/redux/UserSlice';
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Helpers} from "@/constants/Helpers";
import {persistor} from "@/redux/ReduxConfig";


const Login = () => {

    const dispatch = useDispatch();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessages, setErrorMessages] = useState<string>('');
    const user = useSelector((state: any) => state.user.userData) as UserResponse;


    useEffect(() => {
        const fetchData = async () => {
            const token = await AuthService.getAccessToken();
            console.log('login', token);
            if (token && user?.id) {
                router.replace("/(tabs)/");
            } else {
                dispatch(logout({}))
                await persistor.purge();
            }
        }
        fetchData();
    }, [user]);

    const _handleSignInWithGoogle = () => {
        console.log('Sign in with Google');
    }


    const _handleLogin = async () => {
        if (_isLoginFormNotValid()) {
            setErrorMessages('Please enter email and password');
            setTimeout(() => {
                setErrorMessages('');
            }, 5000);
            return;
        }

        try {
            const data = await AuthService.logIn({email, password});
            if (!data) {
                throw new Error('Invalid login credentials');
            }
            dispatch(getUserProfile() as any)
            router.replace('/Welcome');
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessages('Password or email not correct');
            setTimeout(() => {
                setErrorMessages('');
            }, 5000);
        }
    }


    const _handleForgotPassword = () => {
        console.log('Forgot Password');
    }

    const _handleSignUp = () => {
        router.replace('/Register');
    }

    const _isLoginFormNotValid = (): boolean => (email.trim() === '' || password.trim() === '');


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
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>}
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
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='lock-outline' size={30}/>}
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
                                <View style={styles.dividerContainerSignUp}>
                                    <Divider style={styles.dividerStyle}/>
                                    <Text style={styles.signInTextStyle}>Sign in with</Text>
                                    <Divider style={styles.dividerStyle}/>
                                </View>

                                {/* Social Media Icons */}
                                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 30}}>
                                    <TouchableOpacity disabled={true}>
                                        <FontAwesome5 name="facebook" size={40} color="blue"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={_handleSignInWithGoogle}>
                                        <AntDesign name="google" size={40} color="blue"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={true}>
                                        <AntDesign name="twitter" size={40} color="blue"/>
                                    </TouchableOpacity>
                                </View>

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
        marginTop: hp(5),
    },
    logoContainer: {
        width: wp(85),
        height: hp(25),
        alignContent: 'center',
        marginTop: hp(-30),

    },
    headerTitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: hp(5),
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, .3)',
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
        marginTop: hp(13)

    },
});

export default Login;
