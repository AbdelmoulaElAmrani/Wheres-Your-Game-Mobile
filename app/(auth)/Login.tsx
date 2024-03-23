import { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { TextInput } from "react-native-paper";
import { AntDesign } from '@expo/vector-icons';
import CustomButton from '@/components/CustomButton';
import { Divider } from "react-native-paper";
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from "expo-router";

const Login = () => {

    const _handleSignInWithGoogle = () => {
        console.log('Sign in with Google');
    }
    const _handleLogin = () => {
        if (_isLoginFormNotValid()) {
            setErrorMessages(['Please enter username and password']);
            setTimeout(() => {
                setErrorMessages([]);
            }, 5000);
            return;
        }
        router.navigate('Welcome');
    }
    const _handleForgotPassword = () => {
        console.log('Forgot Password');
    }

    const _handleSignUp = () => {
        router.navigate('Register');
    }

    const _isLoginFormNotValid = (): boolean => (userName.trim() === '' || password.trim() === '');

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessages, setErrorMessages] = useState([] as string[]);

    return (
        <>
            <StatusBar style="light" />
            <ImageBackground
                style={{ height: hp(100) }}
                source={require('../../assets/images/signupBackGround.jpg')}
            >
                {/* Card Component */}
                <SafeAreaView style={styles.container}>
                    <View style={styles.cardContainer}>
                        <View style={styles.headerContainer}>
                            <Image style={styles.logoContainer}
                                source={require('../../assets/images/logoBall.png')} />
                        </View>
                        <View style={styles.formContainer}>
                            <View>
                                <Text style={styles.textLabel}>User Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'User Name'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30} />}
                                    value={userName}
                                    onChangeText={setUserName}
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
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='lock-outline' size={30} />}
                                    value={password}
                                    onChangeText={setPassword}
                                    underlineColor={"transparent"}
                                />
                            </View>
                            <View style={styles.mgTop}>
                                <CustomButton text="Login" onPress={_handleLogin} disabled={_isLoginFormNotValid()} />
                            </View>
                            {/* forgot password ? */}
                            <View style={styles.mgTop}>
                                <TouchableOpacity onPress={_handleForgotPassword}>
                                    <Text style={{ color: 'blue', textAlign: 'center', fontSize: 18 }}>Forgot Password ?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Sign in with */}
                            <View style={styles.dividerContainerSigninUp}>
                                <Divider style={styles.dividerStyle} />
                                <Text style={styles.signinTextStyle}>Sign in with</Text>
                                <Divider style={styles.dividerStyle} />
                            </View>

                            {/* Social Media Icons */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 }}>
                                <TouchableOpacity disabled={true}>
                                    <FontAwesome5 name="facebook" size={40} color="blue" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={_handleSignInWithGoogle}>
                                    <AntDesign name="google" size={40} color="blue" />
                                </TouchableOpacity>
                                <TouchableOpacity disabled={true}>
                                    <AntDesign name="twitter" size={40} color="blue" />
                                </TouchableOpacity>
                            </View>

                            {errorMessages.map((message, index) => (
                                <Text key={index} style={{ color: 'red', textAlign: 'center', fontSize: 16, marginTop: 30 }}>{message}</Text>
                            ))}

                            {/* Dont have an account ? Sign Up */}
                            <View style={styles.dontHaveAccountText}>
                                <Text style={{ color: 'black', textAlign: 'center', fontSize: 16 }}>Don't have an account ?
                                </Text>
                                <TouchableOpacity onPress={_handleSignUp}>
                                    <Text style={{ color: 'blue', textAlign: 'center', fontSize: 16 }}> Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
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
    dividerContainerSigninUp: {
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
    signinTextStyle: {
        fontSize: 18,
        marginHorizontal: 20
    },
    dontHaveAccountText: {
        marginTop: 150,
        flexDirection: 'row',
        justifyContent: 'center'

    },
});

export default Login;
