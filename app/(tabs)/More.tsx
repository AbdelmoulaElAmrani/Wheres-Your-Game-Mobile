import {Keyboard, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {router, useRouter} from "expo-router";
import {logout} from "@/redux/UserSlice";
import {AuthService} from "@/services/AuthService";
import {AntDesign} from "@expo/vector-icons";
import UserType from "@/models/UserType";
import LocalStorageService from "@/services/LocalStorageService";
import {removePushToken} from "@/services/pushNotificationService";

const More = () => {
    const dispatch = useDispatch();
    const currentUser: any = useSelector((state: any) => state.user.userData);
    const _router = useRouter();

    const _handleLogout = async () => {
        try {
            const token = await LocalStorageService.getItem<string>('expoPushToken');
            if (token) {
                await removePushToken(token);
                await LocalStorageService.removeItem('expoPushToken')
            }
        } catch (error) {
            console.error("failed removing token:", error);
        } finally {
            await AuthService.logOut();
            await dispatch(logout({}));
            router.replace('/Login');
        }
    }

    const _openPrivacySettings = () => {
        router.navigate('/(settings)/(privacySettings)');
    };
    const _openLocationSettings = () => {
        Linking.openSettings().catch(() => {
            alert('Unable to open app settings');
        });
    };
    const _openProfilePreference = () => {
        router.navigate('/(settings)/ProfilePreference');
    };
    const _openEditProfile = () => {
        _router.push({
            pathname: '/EditProfile',
            params: {data: 'profile'},
        });
    };

    return (
        <>
            <StatusBar style="light"/>
            <ImageBackground
                style={{height: hp(100)}}
                source={require('../../assets/images/signupBackGround.jpg')}>
                <SafeAreaView style={{height: hp(100)}}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.mainContainer}>
                            <Text style={styles.textSettings}>More</Text>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}} bounces={true}>
                                <TouchableOpacity
                                    onPress={_openEditProfile}
                                    style={styles.settingOption}>
                                    <Text style={styles.settingOptionText}>Edit Profile & Contact Information</Text>
                                    <AntDesign name="right" size={24} color="grey"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={_openLocationSettings}
                                    style={styles.settingOption}>
                                    <Text style={styles.settingOptionText}>Location Settings</Text>
                                    <AntDesign name="right" size={24} color="grey"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={_openPrivacySettings}
                                    style={styles.settingOption}>
                                    <Text style={styles.settingOptionText}>Privacy Settings</Text>
                                    <AntDesign name="right" size={24} color="grey"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={_openProfilePreference}
                                    style={styles.settingOption}>
                                    <Text style={styles.settingOptionText}>Profile Preference</Text>
                                    <AntDesign name="right" size={24} color="grey"/>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.settingOption, {backgroundColor: 'red'}]}
                                                  onPress={_handleLogout}>
                                    <Text style={[styles.settingOptionText, {color: 'white'}]}>Log Out</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </SafeAreaView>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopEndRadius: 35,
        borderTopStartRadius: 35,
        paddingTop: 30,
        padding: 20,
        marginTop: 10,
        minHeight: hp(100),
        width: wp(100)
    },
    textSettings: {
        fontSize: 20,
        fontWeight: '800',
        color: 'black',
        marginTop: '2%',
        marginBottom: '5%',
        marginLeft: 10
    },
    settingOption: {
        borderWidth: 0.5,
        borderColor: '#E9EDF9',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 1,
    },
    settingOptionText: {
        fontSize: 18,
        color: 'black',
        fontWeight: '600'
    },
});

export default More;