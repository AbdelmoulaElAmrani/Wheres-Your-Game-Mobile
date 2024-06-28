import CustomNavigationHeader from "@/components/CustomNavigationHeader"
import Gender from "@/models/Gender";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {getUserProfile, updateUserProfile} from "@/redux/UserSlice";
import {useCallback, useEffect, useState} from "react";
import {ImageBackground, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useDispatch, useSelector} from "react-redux";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {TextInput} from "react-native-paper";
import {DatePickerModal, enGB} from 'react-native-paper-dates';
import CustomButton from "@/components/CustomButton";
import {router, useLocalSearchParams} from "expo-router";
import {registerTranslation} from 'react-native-paper-dates'
import RNPickerSelect from 'react-native-picker-select';
import {getSports} from "@/redux/SportSlice";
import Sport from "@/models/Sport";

const EditCoachProfile = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const {availableSport}: { availableSport: Sport[] } = useSelector((state: any) => state.sport);
    const dispatch = useDispatch();
    const [user, setUser] = useState<UserResponse>({
        countryCode: "",
        isCertified: false,
        positionCoached: "",
        yearsOfExperience: 0,
        address: "",
        age: 0,
        bio: "",
        email: "",
        firstName: "",
        gender: Gender.DEFAULT,
        imageUrl: "",
        lastName: "",
        phoneNumber: "",
        role: "",
        zipCode: "",
        id: "",
        dateOfBirth: new Date()
    });
    const params = useLocalSearchParams();
    registerTranslation("en", enGB);

    useEffect(() => {
        if (userData) {
            setUser(userData);
        } else {
            dispatch(getUserProfile() as any)
        }
        dispatch(getSports() as any);
    }, []);


    const goBackFunc = () => {
        return currentStep === 1 ? undefined : goToPreviousStep;
    }
    const goToPreviousStep = () => {
        setCurrentStep(oldValue => Math.max(1, oldValue - 1));
    };

    const _handleContinue = async () => {
        setCurrentStep(oldValue => Math.min(3, oldValue + 1));
        if (currentStep >= 3) {
            try {
                await _handleUpdateUser();
                if (params?.previousScreenName)
                    router.setParams({previousScreenName: 'profile'})
                router.navigate('/Profile');
            } catch (e) {
                console.log(e);
            }
        }
    }

    const _handleUpdateUser = async () => {
        dispatch(updateUserProfile(user) as any);
    }

    const CoachInfoEdit = () => {
        const [editUser, setEditUser] = useState<any>(user)
        const [open, setOpen] = useState(false);
        const [date, setDate] = useState<Date | undefined>(new Date());
        const onDismissSingle = useCallback(() => {
            setOpen(false);
        }, [setOpen]);

        const onConfirmSingle = useCallback(
            (params: any) => {
                setOpen(false);
                setDate(params.date);
            },
            [setOpen, setDate]
        );

        const _handleContinueCoachInfo = async () => {
            let age = new Date().getFullYear() - date!.getFullYear();

            setUser(oldValue => ({...editUser, age: age}));
            await _handleContinue();
        }

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <KeyboardAwareScrollView style={{flex: 1}}
                                             contentContainerStyle={{flexGrow: 1}}
                                             keyboardShouldPersistTaps="handled">

                        <View style={styles.formContainer}>
                            <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5}}>Personal
                                Info</Text>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>First Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'First Name'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>}
                                    value={editUser.firstName}
                                    onChangeText={(text) => setEditUser({...editUser, firstName: text})}
                                    underlineColor={"transparent"}
                                />
                                <Text style={styles.textLabel}>Last Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Last Name'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>}
                                    value={editUser.lastName}
                                    onChangeText={(text) => setEditUser({...editUser, lastName: text})}
                                    underlineColor={"transparent"}

                                />
                                <Text style={styles.textLabel}>Gender</Text>

                                <RNPickerSelect
                                    onValueChange={(value) => setEditUser({...editUser, gender: value})}
                                    items={[
                                        {label: 'Male', value: 'MALE', key: 1},
                                        {label: 'Female', value: 'FEMLAE', key: 2}
                                    ]}
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    placeholder={{label: 'Select gender', value: null}}
                                    value={editUser.gender}

                                />
                                <Text style={styles.textLabel}>Date of Birth</Text>
                                <DatePickerModal
                                    mode="single"
                                    visible={open}
                                    onDismiss={onDismissSingle}
                                    date={date}
                                    onConfirm={onConfirmSingle}
                                    saveLabel="Select Date"
                                    label="Select birth date"
                                    animationType="slide"
                                    locale="en"
                                    onChange={(p) => setDate(p.date)}
                                />
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Date of Birth'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='calendar' size={30}/>}
                                    value={date?.toDateString()}
                                    onFocus={() => setOpen(true)}
                                    underlineColor={"transparent"}

                                />

                                <Text style={styles.textLabel}>Tell us about yourself</Text>
                                <TextInput
                                    style={styles.inputInfoStyle}
                                    placeholder={'Tell us about yourself'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    value={editUser.bio}
                                    onChangeText={(text) => setEditUser({...editUser, bio: text})}
                                    underlineColor={"transparent"}
                                    multiline={true}
                                    numberOfLines={4}

                                />
                                <View style={styles.buttonContainer}>
                                    <CustomButton text="Continue" onPress={_handleContinueCoachInfo}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        )
    }


    const CoachLocationInfoEdit = () => {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <KeyboardAwareScrollView style={{flex: 1}}>
                        <View style={styles.formContainer}>
                            <Text
                                style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5}}>Address</Text>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Country</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Country'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='earth' size={30}/>}
                                    underlineColor={"transparent"}
                                />
                                <Text style={styles.textLabel}>State/Rigion</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'State/Rigion'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='earth' size={30}/>}
                                    underlineColor={"transparent"}
                                />
                                <Text style={styles.textLabel}>Adress</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Adress'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='city' size={30}/>}
                                    underlineColor={"transparent"}
                                    value={user.address}
                                    onChangeText={(text) => setUser({...user, address: text})}
                                />
                                <Text style={styles.textLabel}>Zip Code</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Zip Code'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='city' size={30}/>}
                                    underlineColor={"transparent"}
                                    value={user.zipCode}
                                    onChangeText={(text) => setUser({...user, zipCode: text})}
                                />
                                <View style={{marginTop: 170}}>
                                    <CustomButton text="Continue" onPress={_handleContinue}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        )
    }

    const CoachSportInfoEdit = () => {

        const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
        const [positionCoach, setPositionCoach] = useState<string>('');
        const [skillLevel, setSkillLevel] = useState<string>('');
        const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <KeyboardAwareScrollView style={{flex: 1}}>
                        <View style={styles.formContainer}>
                            <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5}}>Sport
                                Info</Text>
                            <View style={styles.mgTop}>

                                <Text style={styles.textLabel}>Your Sport</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={availableSport.map(sport => ({
                                        label: sport.name,
                                        value: sport.id,
                                        key: sport.id
                                    }))}
                                    placeholder={{label: 'Select sport', value: null}}
                                    onValueChange={(value) => setSelectedSport(availableSport.find(sport => sport.id === value) || null)}
                                />
                                <Text style={styles.textLabel}>Position Coach</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Position Coach'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>}
                                    underlineColor={"transparent"}
                                    value={positionCoach}
                                    onChangeText={(text) => setPositionCoach(text)}
                                />
                                <Text style={styles.textLabel}>Skill Level</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={[
                                        {label: 'Beginner', value: 'BEGINNER', key: 1},
                                        {label: 'Intermediate', value: 'INTERMEDIATE', key: 2},
                                        {label: 'Advanced', value: 'ADVANCED', key: 3}
                                    ]}
                                    placeholder={{label: 'Select skill level', value: null}}
                                    value={skillLevel}
                                    onValueChange={(value) => setSkillLevel(value)}
                                />

                                <Text style={styles.textLabel}>Years of Experience</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={Array.from({length: 40}, (_, i) => i).map(i => ({
                                        label: i.toString(),
                                        value: i,
                                        key: i
                                    }))}
                                    placeholder={{label: 'Select years of experience', value: null}}
                                    onValueChange={(value) => setYearsOfExperience(value)}
                                />
                                <View style={{marginTop: 170}}>
                                    <CustomButton text="Continue" onPress={_handleContinue}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        )
    }

    return (
        <>
            <ImageBackground
                style={{height: hp(100)}}
                source={require('../../assets/images/signupBackGround.jpg')}
            >
                <SafeAreaView style={{flex: 1}}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <CustomNavigationHeader text={"Coach"} showBackArrow={true} showSkip={false} showLogo={false}
                                                goBackFunction={goBackFunc()}/>
                    </TouchableWithoutFeedback>
                    <Text style={styles.stepText}>Step {currentStep}/3</Text>
                    <View style={styles.cardContainer}>
                        {currentStep === 1 && <CoachInfoEdit/>}
                        {currentStep === 2 && <CoachLocationInfoEdit/>}
                        {currentStep === 3 && <CoachSportInfoEdit/>}
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderTopEndRadius: 40,
        borderTopStartRadius: 40,
        padding: 20,
        marginTop: 25,
    },
    stepText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        position: 'absolute',
        top: hp(15),
        left: wp(7)
    },
    formContainer: {
        alignSelf: "center",
        width: wp(100),
        borderRadius: 30,
        padding: 20,
        flex: 1
    },
    mgTop: {
        marginTop: 5
    },
    textLabel: {
        color: 'black',
        fontSize: 16,
        marginTop: 10,
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    inputInfoStyle: {
        backgroundColor: 'white',
        height: 120,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    buttonContainer: {
        marginTop: 20
    },
})


export default EditCoachProfile


