import CustomButton from "@/components/CustomButton";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {
    Alert,
    Keyboard,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native"
import {ImageBackground} from "expo-image";
import {Avatar, Text, TextInput} from "react-native-paper";
import PhoneInput from "react-native-phone-number-input";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {SafeAreaView} from "react-native-safe-area-context";
import {Octicons} from '@expo/vector-icons';
import ScrollPicker, {ScrollPickerHandle} from "react-native-wheel-scrollview-picker";
import {router, useLocalSearchParams} from "expo-router";
import Gender from "@/models/Gender";
import MaleIcon from "@/assets/images/svg/MaleIcon";
import FemaleIcon from "@/assets/images/svg/FemaleIcon";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {useDispatch, useSelector} from "react-redux";
import {getUserProfile, updateUserProfile} from "@/redux/UserSlice";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {DatePickerModal, enGB, registerTranslation} from 'react-native-paper-dates';
import Sport from "@/models/Sport";
import RNPickerSelect from 'react-native-picker-select';
import {SportService} from "@/services/SportService";
import SportLevel from "@/models/SportLevel";


const EditProfile = () => {

    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    //const {availableSport}: { availableSport: Sport[] } = useSelector((state: any) => state.sport);
    const [sports, setSports] = useState<Sport[]>([]);


    const params = useLocalSearchParams();

    const [user, setUser] = useState<UserResponse>({
        address: "",
        age: 0,
        bio: "",
        email: "",
        firstName: "",
        gender: Gender.DEFAULT,
        imageUrl: "",
        lastName: "",
        countryCode: "",
        phoneNumber: "",
        role: "",
        zipCode: "",
        id: "",
        dateOfBirth: new Date()
    });

    const [currentStep, setCurrentStep] = useState<number>(1);
    registerTranslation("en", enGB);


    useEffect(() => {
        dispatch(getUserProfile() as any)
        const fetchSport = async () => {
            try {
                const data = await SportService.getAllSports();
                if (data)
                    setSports(data);
            } catch (ex) {
                console.log(ex);
            }
        }
        fetchSport();
        //setUser(userData);
    }, []);

    useEffect(() => {
        if (user?.id == '' || user?.id == undefined) {
            console.log('user', user)
            setUser(userData);
        }
    }, [userData]);

    const _handleUpdateUser = async () => {
        dispatch(updateUserProfile(user) as any);
    }

    const _handleContinue = async () => {
        if (userData.role === 'COACH') {
            setCurrentStep(oldValue => Math.min(3, oldValue + 1));
            if (currentStep >= 3) {
                try {
                    await _handleUpdateUser();
                    if (params?.previousScreenName)
                        router.setParams({previousScreenName: 'profile'})
                    router.navigate('/SportInterested');
                } catch (e) {
                    console.log('update user page', e);
                }
            }
        } else {
            setCurrentStep(oldValue => Math.min(2, oldValue + 1));
            if (currentStep >= 2) {
                try {
                    await _handleUpdateUser();
                    if (params?.previousScreenName)
                        router.setParams({previousScreenName: 'profile'})
                    router.navigate('/SportInterested');
                } catch (e) {
                    console.log('update user page', e);
                }
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
        if (userData?.role === 'COACH') {
            return 'Coach';
        } else {
            switch (currentStep) {
                case 1:
                    return 'Edit Profile';
                case 2:
                    return 'Gender'
                case 3:
                    return '';
            }
        }
    }


    const UserInfoEdit = () => {
        const [editUser, setEditUser] = useState<UserResponse>({...user});
        const phoneInput = useRef<PhoneInput>(null);
        const [open, setOpen] = useState(false);


        const onDismissSingle = useCallback(() => {
            setOpen(false);
        }, [setOpen]);

        const onConfirmSingle = useCallback(
            (params: any) => {
                setOpen(false);
            },
            [setOpen]
        );
        const _handleContinueUserInfo = async () => {
            const errors = _verifyUserInfo(editUser);

            if (errors.length > 0) {
                Alert.alert(errors.join('\n'));
                return;
            }

            setUser(oldValue => ({...editUser}));
            await _handleContinue();
        }

        const _verifyUserInfo = (user: UserResponse): string[] => {
            const errors: string[] = [];
            if (!user.firstName || user.firstName.trim() === '') {
                errors.push('First name is required');
            }
            if (!user.lastName || user.lastName.trim() === '') {
                errors.push('Last name is required');
            }
            if (!user.email || user.email.trim() === '') {
                errors.push('Email is required');
            }
            if (!user.dateOfBirth || user.dateOfBirth.toString().trim() === '') {
                errors.push('Date of birth is required');
            }
            if (!user.address || user.address.trim() === '') {
                errors.push('Address is required');
            }
            if (!user.zipCode || user.zipCode.trim() === '') {
                errors.push('Zip code is required');
            }
            return errors;
        }

        return (<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <>
                <View style={styles.profilePhotoContainer}>
                    {user.imageUrl ? (
                        <Avatar.Image size={100} source={{uri: user.imageUrl}}/>
                    ) : (
                        <Avatar.Text size={100} label={`${editUser.firstName[0] || ''}${editUser.lastName[0] || ''}`}/>
                    )}
                    <TouchableOpacity onPress={_handleProfilePhotoEdit} style={styles.editPhotoIcon}>
                        <Octicons name="pencil" size={24} color={'white'}/>
                    </TouchableOpacity>
                </View>
                <KeyboardAwareScrollView style={{flex: 1}}
                                         contentContainerStyle={{flexGrow: 1}}
                                         keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>
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
                                disabled={true}
                            />
                            <Text style={styles.textLabel}>Date of Birth</Text>
                            <DatePickerModal
                                mode="single"
                                visible={open}
                                onDismiss={onDismissSingle}
                                date={editUser.dateOfBirth ? new Date(editUser.dateOfBirth) : new Date()}
                                onConfirm={onConfirmSingle}
                                saveLabel="Select Date"
                                label="Select birth date"
                                animationType="slide"
                                locale="en"
                                onChange={(p) => {
                                    if (p && p.date) {
                                        setEditUser({...editUser, dateOfBirth: new Date(p.date)});
                                    }
                                }
                                }
                            />
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'Date of Birth'}
                                cursorColor='black'
                                placeholderTextColor={'grey'}
                                left={<TextInput.Icon color={'#D3D3D3'} icon='calendar' size={30}/>}
                                value={new Date(editUser.dateOfBirth).toLocaleDateString()}
                                onFocus={() => setOpen(true)}
                                underlineColor={"transparent"}

                            />

                            <Text style={styles.textLabel}>Phone number</Text>
                            <View style={styles.mgTop}>
                                <TextInput
                                    disabled={true}
                                    style={styles.inputStyle}
                                    placeholder={'Phone number'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='phone' size={30}/>}
                                    value={editUser.countryCode + editUser.phoneNumber}
                                    onFocus={() => setOpen(true)}
                                    underlineColor={"transparent"}

                                />
                                {/* <PhoneInput
                                    disabled={true}
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
                                />*/}
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
                </KeyboardAwareScrollView>
            </>
        </TouchableWithoutFeedback>);
    }
    const UserGenderEdit = memo(() => {

        const [selectedGender, setSelectedGender] = useState<Gender>(user?.gender);

        useEffect(() => {
            setSelectedGender(user?.gender);
        }, [user.gender]);

        const _handleContinueGenderEdit = async () => {
            setUser({...user, gender: selectedGender});
            await _handleContinue();
        };
        const _verifySelectedGender = (sex: Gender): boolean => {
            return selectedGender === sex;
        };

        return (
            <View style={styles.genericContainer}>
                <View style={{justifyContent: 'center', alignContent: 'center'}}>
                    <Text style={[styles.textFirst, {textAlign: 'center'}]}>Tell us about yourself</Text>
                    <Text style={[styles.textSecond, {textAlign: 'center'}]}>To give you a better experience and
                        results, we need to know your
                        gender</Text>
                </View>
                <View style={styles.genderSelection}>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            _verifySelectedGender(Gender.MALE) ? styles.selectedGender : {},
                        ]}
                        onPress={() => setSelectedGender(Gender.MALE)}
                    >
                        <MaleIcon fill={_verifySelectedGender(Gender.MALE) ? 'white' : 'black'}/>
                        <Text style={[
                            styles.genderLabel,
                            {color: _verifySelectedGender(Gender.MALE) ? 'white' : 'black'}
                        ]}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            _verifySelectedGender(Gender.FEMALE) ? styles.selectedGender : {},
                        ]}
                        onPress={() => setSelectedGender(Gender.FEMALE)}
                    >
                        <FemaleIcon fill={_verifySelectedGender(Gender.FEMALE) ? 'white' : 'black'}/>
                        <Text style={[
                            styles.genderLabel,
                            {color: _verifySelectedGender(Gender.FEMALE) ? 'white' : 'black'}
                        ]}>Female</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.sideBySideButtons}>
                    <CustomButton text="Back" onPress={goToPreviousStep} style={styles.backButton}
                                  textStyle={styles.buttonText}/>
                    <CustomButton disabled={selectedGender === Gender.DEFAULT}
                                  text="Continue" onPress={_handleContinueGenderEdit}
                                  style={styles.continueButton}/>
                </View>
            </View>
        );
    });

    /*   const UserAgeEdit = () => {
           const refAge = useRef<ScrollPickerHandle>(null);
           const [selectedAgeIndex, setSelectedAgeIndex] = useState(user?.age - 1);
           const ages = Array.from({length: 100}, (_, i) => i + 1);

           const _onAgeChange = (index: number) => {
               setSelectedAgeIndex(index - 1);
               setUser({...user, age: ages[index - 1]});
           };

           return (<View>
                   <View style={styles.genericContainer}>
                       <Text style={styles.textFirst}>How old are you ?</Text>
                       <Text style={styles.textSecond}>This will help us create personalized plan</Text>
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
                               itemTextStyle={{color: '#ccc', fontSize: 25}}
                               activeItemTextStyle={{color: '#2757cb', fontSize: 50, fontWeight: 'bold'}}
                           />
                       </View>
                       <View style={styles.sideBySideButtons}>
                           <CustomButton text="Back" onPress={goToPreviousStep} style={styles.backButton}
                                         textStyle={styles.buttonText}/>
                           <CustomButton text="Continue" onPress={_handleContinue} style={styles.continueButton}/>
                       </View>
                   </View>
               </View>
           );
       }

   */
    const CoachSportInfoEdit = () => {

        const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
        const [positionCoach, setPositionCoach] = useState<string>('');
        const [skillLevel, setSkillLevel] = useState<string>('');
        const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);

        const [editUser, setEditUser] = useState<UserResponse>({...user});



        const _generateSportLevelItems = (): { label: string; value: string; key: string }[] => {
            return Object.keys(SportLevel).filter((key: string) => !isNaN(Number(SportLevel[key as keyof typeof SportLevel]))).map((key: string) => ({
                label: key,
                value: key.toUpperCase(),
                key: SportLevel[key as keyof typeof SportLevel].toString()
            }));
        };

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
                                    items={sports.map(sport => ({
                                        label: sport.name,
                                        value: sport.id,
                                        key: sport.id
                                    }))}
                                    placeholder={{label: 'Select sport', value: null}}
                                    onValueChange={(value) => setSelectedSport(sports.find(sport => sport.id === value) || null)}
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
                                    items={_generateSportLevelItems()}
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

                                <View style={{marginTop: 30}}>
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
        <ImageBackground
            style={StyleSheet.absoluteFill}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView style={{flex: 1}}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <CustomNavigationHeader text={_getCurrentStepTitle()} goBackFunction={goBackFunc()} showBackArrow/>
                </TouchableWithoutFeedback>
                <Text style={styles.stepText}>Step {currentStep}/3</Text>
                <View style={styles.cardContainer}>
                    {currentStep === 1 && <UserInfoEdit/>}
                    {currentStep === 2 && <UserGenderEdit/>}
                    {currentStep === 3 && <CoachSportInfoEdit/>}
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        height: '90%',
        width: '100%',
        backgroundColor: 'white',
        borderTopEndRadius: 40,
        borderTopStartRadius: 40,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 55,
        marginTop: 55,
    },
    userInfoContainer: {
        //backgroundColor: 'red'
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
        flex: 1
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
        marginTop: 15
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
    genericContainer: {
        flex: 1
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
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.7,
        shadowRadius: 4,
        elevation: 6,
        marginBottom: 20,
    },
    selectedGender: {
        backgroundColor: '#2757CB', // A darker shade to indicate selection
    },
    genderLabel: {
        fontSize: 16,
        marginTop: 5,
        fontWeight: 'bold'
    },
    sideBySideButtons: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10
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
    profilePhotoContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        position: 'absolute',
        top: -50,
        zIndex: 99,
        justifyContent: 'center',
    },
    editPhotoIcon: {
        marginLeft: 10,
        marginTop: 20
    }

})


export default EditProfile;