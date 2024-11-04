import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import {
    Button,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {TextInput} from "react-native-paper";
import {Helpers} from "@/constants/Helpers";
import {AuthService} from "@/services/AuthService";

const EMAIL = ""

const AccountSettings = () => {
    const dispatch = useDispatch();
    const [isPwdOpen, setPwdOpen] = useState<boolean>(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const _handleHelp = () => {
        const email = "wheresyourgame5@gmail.com";
        const subject = "Help Request";
        const body = "Please describe your issue here."; // Optional: You can pre-fill the body as well
        const mailtoURL = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailtoURL).catch((error) => {
            console.error("Failed to open email client:", error);
        });
    };

    const _handleChangePassword = async () => {
        if (passwordData.currentPassword.trim() === '') {
            alert('Current Password is required');
            return;
        }

        if (passwordData.newPassword.trim() === '') {
            alert('New Password is required');
            return;
        }

        if (passwordData.confirmPassword.trim() === '') {
            alert('Confirm Password is required');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (!Helpers._isPasswordValid(passwordData.newPassword)) {
            alert('New password must be at least 6 characters long and include at least one uppercase letter.');
            return;
        }

        try {
            const response = await AuthService.changePassword(passwordData);

            if (response) {
                alert('Password changed successfully');
                setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''});
                setPwdOpen(false);
            } else {
                alert('Failed to change password');
            }
        } catch (error) {
            alert('An error occurred while changing the password');
            console.error(error);
        }
    };


    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={'Account'} showBackArrow/>
                <View style={styles.cardContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{flexGrow: 1}} bounces={true}>
                        <View style={{flex: 1, paddingHorizontal: 5}}>
                            <Text style={styles.textSettings}>Settings</Text>
                            <TouchableOpacity
                                onPress={() => setPwdOpen(old => !old)}
                                style={[styles.settingOption, isPwdOpen && {backgroundColor: "#2757CB"}]}>
                                <Text style={[styles.settingOptionText, isPwdOpen && {color: 'white'}]}>Change
                                    Password</Text>
                                <AntDesign name={!isPwdOpen ? "right" : "down"} size={24}
                                           color={!isPwdOpen ? "grey" : "white"}/>
                            </TouchableOpacity>
                            {isPwdOpen && <View style={styles.miniCard}>
                                <Text style={styles.textLabel}>Current Password</Text>
                                <TextInput
                                    style={styles.inputPassword}
                                    secureTextEntry
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChangeText={(text) => {
                                        setPasswordData(prev => ({...prev, currentPassword: text}));
                                    }}
                                />

                                <Text style={styles.textLabel}>New Password</Text>
                                <TextInput
                                    style={styles.inputPassword}
                                    secureTextEntry
                                    placeholder="Enter new password"
                                    value={passwordData.newPassword}
                                    onChangeText={(text) => {
                                        setPasswordData(prev => ({...prev, newPassword: text}));
                                    }}
                                />

                                <Text style={styles.textLabel}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.inputPassword}
                                    secureTextEntry
                                    placeholder="Confirm new password"
                                    value={passwordData.confirmPassword}
                                    onChangeText={(text) => {
                                        setPasswordData(prev => ({...prev, confirmPassword: text}));
                                    }}
                                />

                                <Button
                                    title="Change Password" onPress={_handleChangePassword}/>
                            </View>}
                            <TouchableOpacity
                                onPress={_handleHelp}
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
    },
    inputPassword: {
        backgroundColor: 'white',
        height: 40,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderWidth: 1,
        marginBottom: 10
    },
    textLabel: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 10
    },
});

export default AccountSettings;