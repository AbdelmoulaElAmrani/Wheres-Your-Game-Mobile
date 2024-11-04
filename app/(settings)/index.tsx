import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import {Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React from "react";
import {logout} from "@/redux/UserSlice";
import {router, useRouter} from "expo-router";
import {useDispatch} from "react-redux";

const Settings = () => {
    const dispatch = useDispatch()
    const _router = useRouter();

    const _handleLogout = () => {
        dispatch(logout({}));
        router.replace('/Login');
    }

    const _openPrivacySettings = () => {
        router.navigate('(privacySettings)');
    };
    const _openLocationSettings = () => {
        Linking.openSettings().catch(() => {
            alert('Unable to open app settings');
        });
    };

    const _openProfilePreference = () => {
        router.navigate('ProfilePreference');

    };
    const _openEditProfile = () => {
        _router.push({
            pathname: '/EditProfile',
            params: {data: 'profile'},
        });
    };
    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={'Settings'} showBackArrow/>
                <View style={styles.cardContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{flexGrow: 1}} bounces={true}>
                        <View style={{flex: 1, paddingHorizontal: 5}}>
                            <Text style={styles.textSettings}>Settings</Text>
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
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}


const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(2)
    },
    textSettings: {
        fontSize: 20,
        fontWeight: '800',
        color: 'black',
        marginTop: '2%',
        marginBottom: '5%',
        marginLeft: 10
    },
    settingsScrollView: {
        marginTop: hp(2),
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

export default Settings;