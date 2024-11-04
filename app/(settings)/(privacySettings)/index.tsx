import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {logout} from "@/redux/UserSlice";
import {router} from "expo-router";
import {useDispatch} from "react-redux";
import {UserService} from "@/services/UserService";

const PrivacySettings = () => {
    const dispatch = useDispatch();
    const [isPrivacyAcOp, setPrivacyAcOp] = useState<boolean>(false);
    const [isPrivacyEnabled, setPrivacyEnabled] = useState<boolean>(false);

    const _handleLogout = () => {
        dispatch(logout({}));
        router.replace('/Login');
    }
    const toggleSwitch = async () => {
        setPrivacyEnabled(previousState => !previousState);
        //TODO:: Call the service and set the mode annonymous to the value of the state;

    };
    const _handleDeleteAccount = async () => {
        Alert.alert(
            'Confirmation',
            'Are you sure you want to delete your account?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await UserService.deleteUserProfile();
                            if (result) {
                                _handleLogout();
                            } else {
                                Alert.alert('Error', 'Unable to delete your account. Please try again later.');
                            }
                        } catch (e) {
                            Alert.alert('Error', 'An error occurred while deleting your account.');
                        }
                    },
                    style: 'destructive',
                },
            ],
            {cancelable: false}
        );
    }


    const _openAccountSettings = () => {
        router.navigate('/AccountSettings');
    };
    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={'Privacy Settings'} showBackArrow/>
                <View style={styles.cardContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{flexGrow: 1}} bounces={true}>
                        <View style={{flex: 1, paddingHorizontal: 5}}>
                            <Text style={styles.textSettings}>Settings</Text>
                            <TouchableOpacity
                                onPress={_openAccountSettings}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Account</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPrivacyAcOp(old => !old)}
                                style={[styles.settingOption, isPrivacyAcOp && {backgroundColor: '#2757CB'}]}>
                                <Text style={[styles.settingOptionText, isPrivacyAcOp && {color: 'white'}]}>Privacy
                                    Account</Text>
                                <AntDesign name={isPrivacyAcOp ? 'down' : 'right'} size={24}
                                           color={!isPrivacyAcOp ? "grey" : "white"}/>
                            </TouchableOpacity>
                            {isPrivacyAcOp && <View style={styles.miniCard}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    marginBottom: 10
                                }}>
                                    <Text style={{fontWeight: 'bold', fontSize: 16}}>Privacy Account</Text>
                                    <Switch
                                        onValueChange={toggleSwitch}
                                        value={isPrivacyEnabled}
                                    />
                                </View>
                                <Text style={{color: 'grey'}}>If privacy is turned on, only users you approve can
                                    follow, message you, and watch
                                    your videos.</Text>
                            </View>}
                            <TouchableOpacity style={[styles.settingOption, {backgroundColor: 'white'}]}
                                              onPress={_handleDeleteAccount}>
                                <Text style={[styles.settingOptionText, {color: 'red'}]}>Delete Account</Text>
                                <Ionicons name="warning-outline" size={24} color="red"/>
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
    miniCard: {
        backgroundColor: 'white',
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 1,
    }
});

export default PrivacySettings;