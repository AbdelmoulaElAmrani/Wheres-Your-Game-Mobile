import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { AntDesign } from '@expo/vector-icons';


const UserStepForm = () => {

    const [currentStep, setCurrentStep] = useState<number>(1);
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

    const StepOne = () => (
        <View>
            <View style={styles.rowContainer}>
                <View style={styles.squareContainer}>
                    <View>
                        <AntDesign name="checkcircle" size={24} color="white" />
                    </View>
                    <View>
                        <Text>Parents</Text>
                    </View>
                    <Text>I am creating a parent profile</Text>
                </View>
                <View style={styles.squareContainer}></View>
            </View>
            <View style={styles.rowContainer}>
                <View style={styles.squareContainer}>
                    <View>
                        <AntDesign name="checkcircle" size={24} color="white" />
                    </View>
                    <View>
                        <Text>Parents</Text>
                    </View>
                    <Text>I am creating a parent profile</Text>
                </View>
                <View style={styles.squareContainer}></View>
            </View>
        </View>
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
                        <View style={{ justifyContent: 'center', alignContent: "center", marginTop: 25 }}>
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
        backgroundColor: 'red',
        height: 200,
        width: 160,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: 'grey'
    }
});

export default UserStepForm;
