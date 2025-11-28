import {Alert, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View, Platform} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import CustomButton from "@/components/CustomButton";
import {useEffect, useState} from "react";
import {router} from "expo-router";
import {AuthService} from "@/services/AuthService";
import {AntDesign} from "@expo/vector-icons";
import Modal from "react-native-modal";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import LocalStorageService from "@/services/LocalStorageService";
import {IResetTokenObj} from "@/models/IUserInfo";
import {useAlert} from "@/utils/useAlert";
import StyledAlert from "@/components/StyledAlert";
import {TextInput} from "react-native-paper";

const FPReset = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [resetToken, setResetToken] = useState<IResetTokenObj | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {showErrorAlert, showSuccessAlert, showStyledAlert, alertConfig, closeAlert} = useAlert();

    const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasMinLength = newPassword.length >= 8;
    const caseRequirement = hasLowercase && hasUppercase;

    const complexityScore =
        [hasNumberOrSymbol, hasLowercase, hasUppercase, hasMinLength].filter(Boolean)
            .length / 4;


    useEffect(() => {
        const getResetToken = async () => {
            const token = await LocalStorageService.getItem<IResetTokenObj>("resetToken");
            if (token == null) router.replace('/Login');
            else setResetToken(token);
        }
        getResetToken();
    }, []);

    const getProgressColor = (score: number) => {
        if (score < 0.33) return "red";
        if (score < 0.66) return "orange";
        return "green";
    };
    const getIconName = (met: boolean) => (met ? "checkcircleo" : "closecircleo");
    const getIconColor = (met: boolean) => (met ? "green" : "red");
    const criteriaTextColor = (s: boolean) => s ? "green" : "red";

    const _handleOnResetPassword = async () => {
        if (resetToken == null) return;
        if (!caseRequirement || !hasMinLength || !hasNumberOrSymbol) {
            showErrorAlert('Password does not satisfy the requirements.', closeAlert);
            return;
        }

        if (newPassword !== confirmPassword) {
            showErrorAlert('Passwords do not match.', closeAlert);
            return;
        }

        try {
            setIsLoading(true);
            const response = await AuthService.resetPasswordFG({id: resetToken.id, resetToken: resetToken.resetToken, newPassword: newPassword});
            if (response) {
                await LocalStorageService.removeItem("resetToken");
                setModalVisible(true);
                showSuccessAlert('Password reset successfully!', closeAlert);
            } else {
                showErrorAlert('Failed to reset password.', closeAlert);
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            showErrorAlert('An error occurred during password reset.', closeAlert);
        } finally {
            setIsLoading(false);
        }
    };
    const _handleGotoHomePage = () => {
        setModalVisible(false);
        router.replace('/Login');
    };
    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../../assets/images/signupBackGround.jpg')}>
                <SafeAreaView>
                    <CustomNavigationHeader showBackArrow={false} showSkip={false} showLogo={true}/>
                    <KeyboardAwareScrollView enableOnAndroid={true} extraHeight={hp(5)}
                                             showsHorizontalScrollIndicator={false}
                                             showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View style={styles.mainContainer}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Forget Password</Text>
                                <Text style={styles.subTitle}>Please enter your new password and
                                    confirm password
                                </Text>
                            </View>
                            <View style={{
                                alignItems: "center",
                                height: '50%',
                                marginBottom: hp(13),
                                marginTop: 30
                            }}>
                                {/* New Password Field */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter new password"
                                        secureTextEntry={!showNewPassword}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        right={
                                            <TextInput.Icon
                                                icon={showNewPassword ? 'eye-off' : 'eye'}
                                                onPress={() => setShowNewPassword(!showNewPassword)}
                                                color={'#D3D3D3'}
                                                size={28}
                                            />
                                        }
                                        underlineColor={"transparent"}
                                    />
                                </View>
                                {/* Confirm New Password Field */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm New Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm new password"
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        right={
                                            <TextInput.Icon
                                                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                color={'#D3D3D3'}
                                                size={28}
                                            />
                                        }
                                        underlineColor={"transparent"}
                                    />
                                </View>

                                {/* Progress Bar for Password Complexity */}
                                <View style={styles.progressContainer}>
                                    <View
                                        style={[
                                            styles.progressBar,
                                            {
                                                width: `${complexityScore * 100}%`,
                                                backgroundColor: getProgressColor(complexityScore),
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={{width: '90%', marginTop: hp(2)}}>
                                    <Text style={{fontWeight: 'bold', fontSize: 18, color: 'grey'}}>Medium password,
                                        Must contain</Text>
                                    <View style={styles.criteriaRow}>
                                        <AntDesign
                                            name={getIconName(hasNumberOrSymbol)}
                                            size={24}
                                            color={getIconColor(hasNumberOrSymbol)}
                                        />
                                        <Text
                                            style={[styles.criteriaText, {color: criteriaTextColor(hasNumberOrSymbol)}]}>
                                            least one number (0-9) or symbol
                                        </Text>
                                    </View>
                                    <View style={styles.criteriaRow}>
                                        <AntDesign
                                            name={getIconName(caseRequirement)}
                                            size={24}
                                            color={getIconColor(caseRequirement)}
                                        />
                                        <Text
                                            style={[styles.criteriaText, {color: criteriaTextColor(caseRequirement)}]}>
                                            Lowercase (a-z) and uppercase (A-Z)
                                        </Text>
                                    </View>
                                    <View style={styles.criteriaRow}>
                                        <AntDesign
                                            name={getIconName(hasMinLength)}
                                            size={24}
                                            color={getIconColor(hasMinLength)}
                                        />
                                        <Text style={[styles.criteriaText, {color: criteriaTextColor(hasMinLength)}]}>
                                            Least 8 characters
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <CustomButton text={'Reset Password'} onPress={_handleOnResetPassword}/>
                        </View>
                    </View>
                    <Modal
                        style={{justifyContent: 'flex-end', marginBottom: hp(3)}}
                        backdropOpacity={0.5}
                        isVisible={modalVisible} animationIn={"bounceInUp"} avoidKeyboard={true}>
                        <View style={{backgroundColor: 'white', padding: 20, borderRadius: 15}}>
                            <View style={{alignItems: 'center', marginVertical: 30}}>
                                <View style={{backgroundColor: '#2757CB', height: 120, width: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center'}}>
                                    <AntDesign name="checksquare" size={40} color="white" />
                                </View>
                            </View>
                            <Text style={{fontWeight: 'bold', fontSize: 20, textAlign: 'center'}}>Congratulation!</Text>
                            <Text style={{
                                color: 'grey',
                                fontSize: 16,
                                textAlign: 'center',
                                marginTop: 10,
                                marginBottom: 30
                            }}>Now account is ready to use</Text>
                            <CustomButton text={'Go to homepage'} onPress={_handleGotoHomePage}/>
                        </View>
                    </Modal>
                    <StyledAlert
                        visible={showStyledAlert}
                        config={alertConfig}
                        onClose={closeAlert}
                    />
                    </KeyboardAwareScrollView>
                </SafeAreaView>
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
        fontSize: 25
    },
    subTitle: {
        fontSize: 16,
        color: 'grey',
        textAlign: 'center'
    },
    inputGroup: {
        width: "90%",
        marginBottom: 20,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: "500",
    },
    input: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    progressContainer: {
        width: "90%",
        height: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 10,
    },
    progressBar: {
        height: "100%",
    },
    criteriaText: {
        fontSize: 16,
        marginLeft: 8,
    },
    criteriaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    }
});

export default FPReset;