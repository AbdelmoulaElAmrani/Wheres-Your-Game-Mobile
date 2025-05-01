import {Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import CustomButton from "@/components/CustomButton";
import React, {useState} from "react";
import {UserService} from "@/services/UserService";
import {Helpers} from "@/constants/Helpers";
import {Avatar} from "react-native-paper";
import {useRouter} from "expo-router";
import {IUserInfo} from "@/models/IUserInfo";



const Index = () => {
    const [userInfo, setUerInfo] = useState<IUserInfo | null>(null);
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const _router = useRouter();

    const _handleSearchUserByEmail = async () => {
        const user = await UserService.getUserInfoByEmail(email);
        if (user != null) {
            setUerInfo(user as IUserInfo);
            setError(false);
        } else {
            setError(true);
            setUerInfo(null);
        }
        Keyboard.dismiss();
    }

    const _handleUserPress = () => {
        if (userInfo != null){
            _router.push({
                pathname: '/FPVerification',
                params: {userInfo: JSON.stringify(userInfo)},
            });
        }
    };
    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView>
                    <CustomNavigationHeader showBackArrow={true} showSkip={false} showLogo={true}/>
                    <View style={styles.container}>
                        <View style={styles.mainContainer}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Forget Password</Text>
                                <Text style={styles.subTitle}>Please enter your registered email to reset your
                                    password
                                </Text>
                            </View>
                            <View style={{marginTop: hp(5), alignItems: 'center'}}>
                                <TextInput textContentType={"emailAddress"}
                                           onChangeText={(text) => setEmail(text)}
                                           placeholder={'Email'}
                                           style={styles.inputText}/>
                                <CustomButton text={'Search'}
                                              disabled={!Helpers.validEmail(email)}
                                              style={{marginTop: 30, width: wp(50), height: hp(5)}}
                                              onPress={_handleSearchUserByEmail}/>

                                {userInfo !== null && (
                                    <View style={{marginTop: 50}}>
                                        <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 20}}>Is that
                                            you?</Text>
                                        <TouchableOpacity
                                            style={styles.card}
                                            onPress={() => _handleUserPress()}>
                                            <View style={styles.cardImage}>
                                                {userInfo.imageUrl ? (
                                                    <Avatar.Image size={50} source={{uri: userInfo.imageUrl}}/>
                                                ) : (
                                                    <Avatar.Text
                                                        size={50}
                                                        label={(userInfo.firstName.charAt(0) + userInfo.lastName.charAt(1)).toUpperCase()}
                                                    />
                                                )}
                                            </View>
                                            <Text style={{
                                                textAlign: 'center',
                                                fontSize: 16,
                                                fontWeight: "600",
                                                marginTop: 10,
                                            }}>{`${userInfo.firstName} ${userInfo.lastName}`}</Text>
                                        </TouchableOpacity>
                                    </View>

                                )}

                                {error && (
                                    <Text style={styles.errorText}>
                                        The user with this email {email} is not found or the user is signed in with
                                        Gmail
                                    </Text>
                                )}
                                <View></View>
                            </View>
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
        fontSize: 25,
    },
    subTitle: {
        fontSize: 16,
        color: 'grey',
        textAlign: 'center',
        marginTop: 10
    },
    inputText: {
        borderWidth: 0.5,
        borderRadius: 30,
        height: 48,
        paddingHorizontal: 30,
        paddingVertical: 0,
        width: wp(90),
        fontSize: 16
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginTop: 20,
        textAlign: "center"
    },
    card: {
        backgroundColor: 'white',
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        margin: 6,
        paddingHorizontal: 20,
    },
    cardImage: {
        height: 65,
        width: 85,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default Index;