import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ImageBackground, StyleSheet, Text, Image, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { AntDesign } from "@expo/vector-icons";
import UserType from "@/models/UserType";


const UserStepForm = () => {

    const [currentStep, setCurrentStep] = useState<number>(1);
    //const [userData, setUserData] = useState<any>({});
    const [selectedType, setSelectedType] = useState<UserType>();
    const _stepTitles = [
        {
            title: 'Choose a user type',
            subTitle: 'Please select the user'
        }, {
            title: 'Verification Number',
            subTitle: 'You will got a OTP via SMS'
        }];

    const buttonText = ['Continue', 'Verify'];


    const goToNextStep = () => {
        setCurrentStep(oldValue => Math.max(2, oldValue - 1));
    };

    const _onNext = () => {
        return currentStep === 1 ? goToNextStep : handleSubmit;

    }
    const goBackFunc = () => {
        return currentStep === 1 ? undefined : goToPreviousStep;
    }


    const goToPreviousStep = () => {
        setCurrentStep(oldValue => Math.max(1, oldValue - 1));
    };
    const handleSubmit = () => {
    };

    const _verifySelectedType = (type: UserType): boolean => selectedType == type;

    const StepOne = () => (
        <>
            <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => setSelectedType(UserType.PARENT)} style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.PARENT) ? '#2757CB': 'white'} ]}>
                    {_verifySelectedType(UserType.PARENT) && <View style={styles.checkIcon}>
                        <AntDesign name="checkcircle" size={20} color="white" />
                    </View>}
                    <View>
                        <Image style={{ justifyContent: "center", alignSelf: "center" }} source={require('../../assets/images/parentIcon.png')} />
                        <Text style={styles.userTypeTitle}>Parents</Text>
                    </View>
                    <Text style={{ color: 'white', textAlign: "center", fontSize: 18, marginTop: 15 }}>I am creating a parent profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedType(UserType.PLAYER)} style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.PLAYER) ? '#2757CB': 'white'} ]}>
                    {_verifySelectedType(UserType.PLAYER) && <View style={styles.checkIcon}>
                        <AntDesign name="checkcircle" size={20} color="white" />
                    </View>}
                    <View>
                        <Image style={{ justifyContent: "center", alignSelf: "center" }} source={require('../../assets/images/playerIcon.png')} />
                        <Text style={styles.userTypeTitle}>Player</Text>
                    </View>
                    <Text style={{ color: 'black', textAlign: "center", fontSize: 18, marginTop: 15 }}>I am creating a parent profile</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => setSelectedType(UserType.COACH)} style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.COACH) ? '#2757CB': 'white'} ]}>
                    {_verifySelectedType(UserType.COACH) && <View style={styles.checkIcon}>
                        <AntDesign name="checkcircle" size={20} color="white" />
                    </View>}
                    <View>
                        <Image style={{ justifyContent: "center", alignSelf: "center" }} source={require('../../assets/images/coachIcon.png')} />
                        <Text style={styles.userTypeTitle}>Coach/Trainer</Text>
                    </View>
                    <Text style={{ color: 'black', textAlign: "center", fontSize: 18, marginTop: 15 }}>Camps/Games Leagues Officiating Organization</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedType(UserType.BUSINESS)} style={[styles.squareContainer, {backgroundColor: _verifySelectedType(UserType.BUSINESS) ? '#2757CB': 'white'} ]}>
                    {_verifySelectedType(UserType.BUSINESS) && <View style={styles.checkIcon}>
                        <AntDesign name="checkcircle" size={20} color="white" />
                    </View>}
                    <View>
                        <Image style={{ justifyContent: "center", alignSelf: "center" }} source={require('../../assets/images/advertiserIcon.png')} />
                        <Text style={styles.userTypeTitle}>Business/Advertising Consultant</Text>
                    </View>
                    <Text style={{ marginTop: 15 }}></Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const StepTwo = () => (
        <View>

        </View>
    );

    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>
                <CustomNavigationHeader text={"User"} goBackFunction={goBackFunc()} />
                <View style={styles.container}>
                    <Text style={styles.stepText}>Step {currentStep}/2</Text>
                    <View style={styles.mainContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{_stepTitles[currentStep - 1].title}</Text>
                            <Text style={styles.subTitle}>{_stepTitles[currentStep - 1].subTitle}</Text>
                        </View>
                        <View style={{ justifyContent: 'center', alignContent: "center", marginTop: 25, marginBottom: 25 }}>
                            {currentStep === 1 && <StepOne />}
                            {currentStep === 2 && <StepTwo />}
                        </View>
                        <CustomButton text={buttonText[currentStep - 1]} onPress={_onNext()} />
                    </View>
                </View>
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
    button: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    stepText: {
        color: 'white',
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 30
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
        color: 'grey'
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        marginBottom: 10
    },
    squareContainer: {
        backgroundColor: 'white',
        height: 200,
        width: 150,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },
    checkIcon: {
        position: "absolute",
        top: 10,
        right: 10
    },
    userTypeTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 5,
        textAlign: "center"
    }
});

export default UserStepForm;
