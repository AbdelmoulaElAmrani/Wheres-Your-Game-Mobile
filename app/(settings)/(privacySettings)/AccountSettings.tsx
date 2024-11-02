import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useState} from "react";
import {useDispatch} from "react-redux";

const AccountSettings = () => {
    const dispatch = useDispatch();
    const [isPwdOpen, setPwdOpen] = useState<boolean>(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const _ChangePassword = async () => {

    }
    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={'Settings'} showBackArrow/>
                <View style={styles.cardContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{flexGrow: 1}} bounces={true}>
                        <View style={{flex: 1, paddingHorizontal: 5}}>
                            <Text style={styles.textSettings}>Settings</Text>
                            <TouchableOpacity
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Change Password</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            {isPwdOpen && <View>

                            </View>}
                            <TouchableOpacity
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Help</Text>
                                <AntDesign name={'right'} size={24} color="grey"/>
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

export default AccountSettings;