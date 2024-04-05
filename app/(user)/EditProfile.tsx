import CustomButton from "@/components/CustomButton";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {useEffect, useRef, useState} from "react";
import { ImageBackground, Keyboard, StyleSheet, TouchableOpacity, View, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { Avatar, Text, TextInput } from "react-native-paper";
import PhoneInput from "react-native-phone-number-input";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from '@expo/vector-icons';
import ScrollPicker, { ScrollPickerHandle } from "react-native-wheel-scrollview-picker";
import { router } from "expo-router";
import Gender from "@/models/Gender";
import MaleIcon from "@/assets/images/svg/MaleIcon";
import FemaleIcon from "@/assets/images/svg/FemaleIcon";
import {UserService} from "@/services/UserService";
import { UserResponse } from "@/models/responseObjects/UserResponse";
import {UserRequest} from "@/models/requestObjects/UserRequest";



const EditProfile = () => {

    const [user, setUser] = useState({
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        email: 'jhon@gmail.com',
        phoneNumber: '1234567890',
        phoneCountryCode: 'FR',
        gender: Gender.MALE,
        imageUrl: null,//'http://www.cecyteo.edu.mx/Nova/App_themes/Nova2016/assets/pages/media/profile/profile_user.jpg'
        address: '1234, Street, City, Country',
        zipCode: '1111135'
    });

    const [currentStep, setCurrentStep] = useState<number>(1);


    useEffect(() => {
        UserService.getUser().then((res) => {
            if (res) {
                console.log(res);
                // @ts-ignore
                setUser(res);
                //setFormattedPhoneNumber(res.phoneNumber);
            }
        });
    }, []);


    const _handleContinue = async () => {
        console.log({...user});
        setCurrentStep(oldValue => Math.min(3, oldValue + 1));
        if (currentStep >= 3) {
            try {
                //TODO:: test this method
                //const res = await UserService.updateUser(user as UserRequest);
                router.navigate('/SportInterested');
            } catch (e) {
                console.log('update user page', e);
            }
        }
    }

    const goBackFunc = () => {
        return currentStep === 1 ? undefined : goToPreviousStep;
    }
    const _handleProfilePhotoEdit = () => {
        console.log('Edit Profile Photo');
    }
    const goToPreviousStep = () => {
        setCurrentStep(oldValue => Math.max(1, oldValue - 1));
    };
    const _getCurrentStepTitle = () => {
        switch (currentStep) {
            case 1:
                return 'Edit Profile';
            case 2:
                return 'Gender';
            case 3:
                return 'Age';
        }
    }


    const UserInfoEdit = () => {
        const [editUser, setEditUser] = useState<any>(user)
        const phoneInput = useRef<PhoneInput>(null);
        const [formattedPhoneNumber, setFormattedPhoneNumber] = useState<string>('');

        const _handleContinueUserInfo = () => {
            setUser(oldValue => ({...editUser}));
            _handleContinue();
        }

        return (<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <>
                <View style={{alignItems: 'center', position: 'absolute', left: wp(30), right: wp(30), top: -55}}>
                    <TouchableOpacity onPress={_handleProfilePhotoEdit}>
                        <Octicons name="pencil" size={24} color={'white'} style={styles.editIcon}/>
                    </TouchableOpacity>
                    {user.imageUrl ? <Avatar.Image size={100} source={{uri: editUser.imageUrl}}/>
                        : <Avatar.Text size={100} label={user.firstName ? user.firstName[0] : ''}/>}
                </View>
                <ScrollView automaticallyAdjustKeyboardInsets={true}>
                    <View style={styles.formContainer}>
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Full Name</Text>
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
                                left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30} />}
                                value={editUser.lastName}
                                onChangeText={(text) => setEditUser({...editUser, lastName: text})}
                                underlineColor={"transparent"}

                            />

                            <Text style={styles.textLabel}>Email</Text>
                            <TextInput
                                style={styles.inputStyle}
                                focusable={false}
                                placeholder={'Email'}
                                cursorColor='black'
                                placeholderTextColor={'grey'}
                                left={<TextInput.Icon color={'#D3D3D3'} icon='email-outline' size={30}/>}
                                value={editUser.email}
                                onChangeText={(text) => setEditUser({...editUser, email: text})}
                                underlineColor={"transparent"}
                            />

                            <Text style={styles.textLabel}>Phone number</Text>
                            <View style={styles.mgTop}>
                                <PhoneInput
                                    ref={phoneInput}
                                    defaultCode={phoneInput?.current?.getCountryCode() || 'US'}
                                    layout="first"
                                    defaultValue="US"
                                    withDarkTheme
                                    placeholder="Enter phone number"
                                    value={editUser.phoneNumber}
                                    onChangeText={(text) => setEditUser({...editUser, phoneNumber: text})}
                                    containerStyle={styles.phoneInputContainer}
                                    textContainerStyle={styles.textPhoneInputContainer}
                                    onChangeFormattedText={(text) => setFormattedPhoneNumber(text)}

                                />
                                <Text style={styles.textLabel}>Address</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Address'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='map-marker-outline' size={30}/>}
                                    value={editUser.address}
                                    onChangeText={(text) => setEditUser({...editUser, address: text})}
                                    underlineColor={"transparent"}
                                />

                                <Text style={styles.textLabel}>Zip Code</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Zip Code'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='map-marker-outline' size={30}/>}
                                    value={editUser.zipCode}
                                    onChangeText={(text) => setEditUser({...editUser, zipCode: text})}
                                    underlineColor={"transparent"}
                                />
                                <View style={styles.buttonContainer}>
                                    <CustomButton text="Continue" onPress={_handleContinueUserInfo}/>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </>
        </TouchableWithoutFeedback>);
    }
    const UserGenderEdit = () => {
        const [selectedGender, setSelectedGender] = useState<Gender>(user?.gender);

        const _handleContinueGenderEdit = () => {
            setUser({...user, gender: selectedGender});
            _handleContinue();
        }

        return (
        <>
            <View style={styles.topTextContainer}>
                <Text style={styles.textFirst}>
                    Tell us about your self
                </Text>
                <Text style={styles.textSecond}>
                    To give you better experience and results, we need to know your gender
                </Text>

                <View style={styles.genderSelection}>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            selectedGender === Gender.MALE && { backgroundColor: '#2757cb' },
                        ]}
                        onPress={() => setSelectedGender(Gender.MALE)}
                    >
                        <MaleIcon fill={selectedGender === Gender.MALE ? 'white' : 'black'} />
                        <Text style={[
                            styles.genderLabel,
                            selectedGender === Gender.MALE ? { color: 'white' } : { color: 'black' }
                        ]
                        }
                        >Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            selectedGender === Gender.FEMALE && { backgroundColor: '#2757cb' },
                        ]}
                        onPress={() => setSelectedGender(Gender.FEMALE)}
                    >
                        <FemaleIcon fill={selectedGender === Gender.FEMALE ? 'white' : 'black'} />
                        <Text style={[
                            styles.genderLabel,
                            selectedGender === Gender.FEMALE ? { color: 'white' } : { color: 'black' }
                        ]
                        }>Female</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.sideBySideButtons}>
                    <CustomButton text="Back" onPress={goToPreviousStep} style={styles.backButton} textStyle={styles.buttonText} />
                    <CustomButton text="Continue" onPress={_handleContinueGenderEdit} style={styles.continueButton}/>
                </View>
            </View>
        </>
        );
    }
    const UserAgeEdit = () => {
        const refAge = useRef<ScrollPickerHandle>(null);
        const [selectedAgeIndex, setSelectedAgeIndex] = useState(user?.age - 1);
        const ages = Array.from({length: 100}, (_, i) => i + 1);

        const _onAgeChange = (index: number) => {
            setSelectedAgeIndex(index - 1);
            setUser({...user, age: ages[index - 1]});
        };

        return (<>
            <View style={styles.topTextContainer}>
                <Text style={styles.textFirst}>
                    How old are you ?
                </Text>
                <Text style={styles.textSecond}>
                    This will help us create personalized plan
                </Text>
                <View style={styles.ageList}>
                    <ScrollPicker
                        ref={refAge}
                        dataSource={ages}
                        selectedIndex={selectedAgeIndex}
                        onValueChange={(selectedIndex) => _onAgeChange(selectedIndex)}
                        wrapperHeight={180}
                        wrapperBackground={'#ffffff'}
                        itemHeight={70}
                        highlightColor={'#2757cb'}
                        highlightBorderWidth={5}
                        itemTextStyle={{ color: '#ccc', fontSize: 25 }}
                        activeItemTextStyle={{ color: '#2757cb', fontSize: 50, fontWeight: 'bold' }}
                    />

                </View>
                <View style={styles.sideBySideButtons}>
                    <CustomButton text="Back" onPress={goToPreviousStep} style={styles.backButton} textStyle={styles.buttonText} />
                    <CustomButton text="Continue" onPress={_handleContinue} style={styles.continueButton} />
                </View>
            </View>
        </>
        );
    }


    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >

            <SafeAreaView>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <CustomNavigationHeader text={_getCurrentStepTitle()} goBackFunction={goBackFunc()}  showBackArrow/>
                </TouchableWithoutFeedback>
                <Text style={styles.stepText}>Step {currentStep}/3</Text>
                <View style={styles.cardContainer}>
                    {currentStep === 1 && <UserInfoEdit />}
                    {currentStep === 2 && <UserGenderEdit />}
                    {currentStep === 3 && <UserAgeEdit />}
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        width: wp('100'),
        height: hp('90'),
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(25),
        position: 'absolute'
    },
    userInfoContainer: {
        backgroundColor: 'red'
    },
    editIcon: {
        top: hp(2),
        right: wp(-20),
        padding: 5,
        zIndex: 3,
        position: 'absolute'

    },
    formContainer: {
        alignSelf: "center",
        width: wp(100),
        borderRadius: 30,
        padding: 20,
        height: hp(100),
    },
    textLabel: {
        color: 'black',
        fontSize: 18,
        fontWeight: "500",
        marginTop: 10,
        textAlign: 'center'
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    mgTop: {
        marginTop: 5
    },
    selectedFlagContainer: {
        backgroundColor: 'white',
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        borderRadius: 10,
        marginRight: 5,
        height: 45,
    },
    flagIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    phoneInputContainer: {
        backgroundColor: 'white',
        height: 51,
        width: wp(90),
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1,
    },
    textPhoneInputContainer: {
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        backgroundColor: 'white'
    },
    buttonContainer: {
        marginTop: hp(5)
    },
    stepText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        position: 'absolute',
        top: hp(15),
        left: wp(7)
    },
    textFirst: {
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    textSecond: {
        color: 'grey',
        fontSize: 16,
        alignSelf: 'center',
        textAlign: 'center',
        marginTop: hp(1)

    },
    topTextContainer: {
        marginLeft: wp(5),
        width: wp(80),
        top: hp(-10),
        textAlign: 'center'
    },
    genderSelection: {
        alignItems: 'center',
        marginTop: hp(5),
    },
    genderOption: {
        width: 120,
        height: 120,
        backgroundColor: 'white',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#f2f4fb',
        shadowColor: '#dcddde',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.7,
        shadowRadius: 4,
        elevation: 6,
        marginBottom: hp(5)
    },
    genderLabel: {
        fontSize: 16,
        marginTop: 5,
        fontWeight: 'bold'
    },
    sideBySideButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: hp(3),
        alignItems: 'center',
        top: hp(5)

    },
    backButton: {
        backgroundColor: 'white',
        borderColor: '#2757CB',
        borderWidth: 1,
        width: wp(40),
        height: 55,
        borderRadius: 30,
        alignSelf: "center",
        justifyContent: "center",
        marginRight: wp(10)
    },
    continueButton: {
        backgroundColor: "#2757CB",
        width: wp(40),
        height: 55,
        borderRadius: 30,
        alignSelf: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 20,
        color: '#2757CB',
        textAlign: 'center'
    },
    ageList: {
        alignItems: 'center',
        marginTop: hp(9),
        marginBottom: hp(2),
        height: hp(35),
        width: wp(80),
    },
    ageItem: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedAgeItem: {
        backgroundColor: '#e0e0e0',

    },
    itemAgeText: {
        fontSize: 18,
    },
    selectedAgeItemText: {
        color: '#2757CB',
    }

})


export default EditProfile;