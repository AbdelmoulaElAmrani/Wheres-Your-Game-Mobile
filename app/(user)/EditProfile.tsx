import CustomButton from "@/components/CustomButton";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Alert, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native"
import {ImageBackground} from "expo-image";
import {Avatar, Text, TextInput} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {SafeAreaView} from "react-native-safe-area-context";
import {Octicons} from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import {router} from "expo-router";
import Gender from "@/models/Gender";
import MaleIcon from "@/assets/images/svg/MaleIcon";
import FemaleIcon from "@/assets/images/svg/FemaleIcon";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {useDispatch, useSelector} from "react-redux";
import {getUserProfile, getUserSports, updateUserProfile} from "@/redux/UserSlice";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {DatePickerModal, enGB, registerTranslation} from 'react-native-paper-dates';
import Sport from "@/models/Sport";
import RNPickerSelect from 'react-native-picker-select';
import {SportService} from "@/services/SportService";
import SportLevel, {convertStringToEnumValue} from "@/models/SportLevel";
import {UserInterestedSport} from "@/models/UserInterestedSport";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {UserRequest} from "@/models/requestObjects/UserRequest";
import {manipulateAsync, SaveFormat} from "expo-image-manipulator";
import {StorageService} from "@/services/StorageService";
import {useRoute} from "@react-navigation/core";
import UserType from "@/models/UserType";


const _AgeGroup = [
    {label: '1', value: '1'},
    {label: '2', value: '2'},
    {label: '3', value: '3'},
    {label: '4', value: '4'},
    {label: '5', value: '5'},
    {label: '6', value: '6'},
    {label: '7', value: '7'},
    {label: '8', value: '8'},
    {label: '9', value: '9'},
    {label: '10', value: '10'},
    {label: '11', value: '11'},
    {label: '12', value: '12'},
    {label: '13', value: '13'},
    {label: '14', value: '14'},
    {label: '15', value: '15'},
    {label: '16', value: '16'},
    {label: '17', value: '17'},
    {label: '18+', value: '18+'}
];

const _typeOfGame = [
    {key: 'League', label: 'League', value: 'League'},
    {key: 'Tournament', label: 'Tournament', value: 'Tournament'},
    {key: 'Pick up Game', label: 'Pick up Game', value: 'Pick up Game'},
    {key: 'Ref', label: 'Ref', value: 'Ref'},
    {key: 'Umpire', label: 'Umpire', value: 'Umpire'},
    {key: 'Official', label: 'Official', value: 'Official'},
    {key: 'Competition', label: 'Competition', value: 'Competition'},
    {key: 'Meet', label: 'Meet', value: 'Meet'},
    {key: 'Match', label: 'Match', value: 'Match'},
]

const _seasonDuration = [
    {key: 'Weekly', label: 'Weekly', value: 'Weekly'},
    {key: 'Monthly', label: 'Monthly', value: 'Monthly'},
    {key: 'Quarterly', label: 'Quarterly', value: 'Quarterly'},
    {key: 'Bi-annually', label: 'Bi-annually', value: 'Bi-annually'},
    {key: 'Annually', label: 'Annually', value: 'Annually'},
]

const _locationOfGame = [
    {key: 'Local', label: 'Local', value: 'Local'},
    {key: 'Regional', label: 'Regional', value: 'Regional'},
    {key: 'National', label: 'National', value: 'National'},
    {key: 'Not available', label: 'Not available', value: 'Not available'},
]

const EditProfile = () => {

    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];

    const [sports, setSports] = useState<Sport[]>([]);
    const [selectedSports, setSelectedSports] = useState<UserInterestedSport[]>([]);

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
        dateOfBirth: new Date(),
        isCertified: false,
        positionCoached: "",
        yearsOfExperience: 0
    });
    type GenderOrNull = Gender | null;

    const route = useRoute();
    const paramData = route.params as any;

    const [currentStep, setCurrentStep] = useState<number>(1);
    registerTranslation("en", enGB);


    useEffect(() => {
        dispatch(getUserProfile() as any);
        if (userData?.id)
            dispatch(getUserSports(userData?.id) as any);
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
    }, []);

    useEffect(() => {
        if (user?.id == '' || user?.id == undefined || user?.id != userData?.id) {
            setUser(userData);
        } else {
            dispatch(getUserSports(userData.id) as any);
        }
    }, [userData]);

    const _handleUpdateUser = async (selectedGender: GenderOrNull = null) => {
        try {
            let updatedUser = {...user};
            if (selectedGender !== null) {
                updatedUser = {...updatedUser, gender: selectedGender};
            }
            const userRequest = updatedUser as UserRequest;
            dispatch(updateUserProfile(userRequest) as any);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const _handleContinue = async (selectedGender: GenderOrNull = null) => {

        if (userData?.role == UserType[UserType.COACH]) {
            setCurrentStep(oldValue => Math.min(3, oldValue + 1));
            if (currentStep >= 3) {
                try {
                    await _handleUpdateUser(selectedGender);
                    if (paramData?.data)
                        router.setParams({previousScreenName: 'profile'})

                    if (selectedSports.length > 0 && userSport.length === 0) {
                        const response = await SportService.registerUserToSport(selectedSports, userData.id);
                    }
                    router.navigate('/(tabs)');
                } catch (e) {
                    console.log(e);
                }
            }
        } else if (userData?.role == UserType[UserType.ORGANIZATION]) {
            setCurrentStep(oldValue => Math.min(4, oldValue + 1));
            if (currentStep >= 4) {
                try {
                    await _handleUpdateUser(selectedGender);
                    if (paramData?.data)
                        router.setParams({previousScreenName: 'profile'})

                    if (selectedSports.length > 0 && userSport.length === 0) {
                        const response = await SportService.registerUserToSport(selectedSports, userData.id);
                    }
                    router.navigate('/(tabs)');
                } catch (e) {
                    console.log(e);
                }
            }
        } else {
            setCurrentStep(oldValue => Math.min(2, oldValue + 1));
            if (currentStep >= 2) {
                try {
                    await _handleUpdateUser(selectedGender);
                    if (paramData?.data)
                        router.setParams({previousScreenName: 'profile'})
                    router.navigate('/SportInterested');
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    const goBackFunc = () => {
        return currentStep === 1 ? undefined : goToPreviousStep;
    }

    const goToPreviousStep = () => {
        setCurrentStep(oldValue => Math.max(1, oldValue - 1));
    };
    const _getCurrentStepTitle = () => {
        if (userData?.role === 'COACH') {
            return 'Coach';
        } else if (userData?.role === 'ORGANIZATION') {
            return 'Organization/Team'
        } else {
            switch (currentStep) {
                case 1:
                    return 'Edit Profile';
                case 2:
                    return (userData?.role === 'ORGANIZATION' ? 'Organization/Team' : 'Gender');
                case 3:
                    return '';
            }
        }
    }

    const _handleEditProfilePic = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.2
        });

        if (!result.canceled) {
            manipulateAsync(result.assets[0].uri, [{resize: {height: 900, width: 900}}], {
                compress: 0.2,
                format: SaveFormat.PNG
            }).then(async (manipulateImgResult) => {
                const formData = new FormData();
                // @ts-ignore
                formData.append(
                    'file',
                    {
                        uri: manipulateImgResult.uri,
                        name: result.assets[0].fileName ? result.assets[0].fileName : 'userProfileImg.png',
                        type: 'image/png'
                    });
                const imageUrl = await StorageService.upload(userData.id, formData);
            }).catch(err => {
                console.error('Error during image manipulation:', err);
            });
        }
    }

    const UserInfoEdit = () => {
        const [editUser, setEditUser] = useState<UserResponse>({...user});
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
                        <Avatar.Image size={100} source={{uri: editUser.imageUrl}}/>
                    ) : (
                        <Avatar.Text size={100} label={`${editUser.firstName[0] || ''}${editUser.lastName[0] || ''}`}/>
                    )}
                    <TouchableOpacity onPress={_handleEditProfilePic} style={styles.editPhotoIcon}>
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

    const UserGenderEdit = (() => {
        const [selectedGender, setSelectedGender] = useState(user?.gender || Gender.DEFAULT);

        useEffect(() => {
            setSelectedGender(user?.gender);
        }, [user.gender, user]);

        const _handleContinueGenderEdit = async () => {
            setUser((prevEditUser) => ({...prevEditUser, gender: selectedGender}));
            await _handleContinue(selectedGender);
        };


        const isMaleSelected = useMemo(() => selectedGender === Gender.MALE, [selectedGender]);
        const isFemaleSelected = useMemo(() => selectedGender === Gender.FEMALE, [selectedGender]);

        return (
            <View style={styles.genericContainer}>
                <View style={{justifyContent: 'center', alignContent: 'center'}}>
                    <Text style={[styles.textFirst, {textAlign: 'center'}]}>Tell us about yourself</Text>
                    <Text style={[styles.textSecond, {textAlign: 'center'}]}>
                        To give you a better experience and results, we need to know your gender
                    </Text>
                </View>
                <View style={styles.genderSelection}>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            isMaleSelected ? styles.selectedGender : {},
                        ]}
                        onPress={() => setSelectedGender(Gender.MALE)}>
                        <MaleIcon fill={isMaleSelected ? 'white' : 'black'}/>
                        <Text
                            style={[
                                styles.genderLabel,
                                {color: isMaleSelected ? 'white' : 'black'},
                            ]}>
                            Male
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            isFemaleSelected ? styles.selectedGender : {},
                        ]}
                        onPress={() => setSelectedGender(Gender.FEMALE)}>
                        <FemaleIcon fill={isFemaleSelected ? 'white' : 'black'}/>
                        <Text
                            style={[
                                styles.genderLabel,
                                {color: isFemaleSelected ? 'white' : 'black'},
                            ]}>Female</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.sideBySideButtons}>
                    <CustomButton
                        text="Back"
                        onPress={goToPreviousStep}
                        style={styles.backButton}
                        textStyle={styles.buttonText}
                    />
                    <CustomButton
                        disabled={selectedGender === Gender.DEFAULT}
                        text="Continue"
                        onPress={_handleContinueGenderEdit}
                        style={styles.continueButton}
                    />
                </View>
            </View>
        );
    });

    const CoachSportInfoEdit = () => {

        const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
        const [positionCoach, setPositionCoach] = useState<string>(user.positionCoached);
        const [sportLevel, setSportLevel] = useState<SportLevel>(SportLevel.Beginner);
        const [yearsOfExperience, setYearsOfExperience] = useState<number>(user.yearsOfExperience);
        const [isCertified, setIsCertified] = useState<boolean>(user.isCertified);

        const [editUser, setEditUser] = useState<UserResponse>({...user});

        const _handleCoachSportInfoEdit = async () => {
            setUser(({
                ...editUser,
                bio: editUser.bio,
                positionCoached: positionCoach,
                yearsOfExperience: yearsOfExperience,
                isCertified: isCertified
            }));
            if (userSport.length === 0) {
                if (!selectedSport) {
                    Alert.alert('Please select a sport');
                    return;
                }
                if (sportLevel === 0) {
                    Alert.alert('Please Skill Level');
                    return;
                }

                const convertedSportLevel = convertStringToEnumValue(SportLevel, sportLevel);
                if (convertedSportLevel === null)
                    return;
                setSelectedSports([...selectedSports,
                    {
                        sportId: selectedSport.id,
                        sportLevel: convertedSportLevel,
                        createAt: new Date(),
                        sportName: selectedSport.name
                    }]);
            }
            if (selectedSports.length === 0 && userSport.length === 0)
                return;
            await _handleContinue();
        }

        const _generateSportLevelItems = (): { label: string; value: string; key: string }[] => {
            return Object.keys(SportLevel).filter((key: string) => !isNaN(Number(SportLevel[key as keyof typeof SportLevel]))).map((key: string) => ({
                label: key,
                value: key,
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
                                    value={userSport[0]?.sportId || selectedSport?.id || null}
                                />
                                <Text style={styles.textLabel}>Position Coach</Text>
                                <TextInput
                                    style={[styles.inputStyle, {paddingLeft: 0}]}
                                    placeholder={'Position Coached'}
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
                                    onValueChange={(value) => setSportLevel(value as SportLevel)}
                                    value={userSport[0]?.sportLevel || sportLevel || null}
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
                                    onValueChange={(value) => setYearsOfExperience(value as number)}
                                    value={yearsOfExperience || null}
                                />

                                <Text style={styles.textLabel}>Certification</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={[{label: 'Yes', value: true, key: 'Yes'}, {
                                        label: 'No',
                                        value: false,
                                        key: 'No'
                                    }]}
                                    placeholder={{label: 'Select certification', value: null}}
                                    onValueChange={(value) => setIsCertified(value as boolean)}
                                    value={isCertified || null}
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
                                    <CustomButton text="Continue" onPress={_handleCoachSportInfoEdit}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        )
    }


    const OrganizationInfoEdit = () => {

        const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
        const [organizationName, setOrganizationName] = useState<string>(user.positionCoached);
        const [sportLevel, setSportLevel] = useState<SportLevel>(SportLevel.Beginner);
        const [yearsOfExperience, setYearsOfExperience] = useState<number>(user.yearsOfExperience);
        const [isCertified, setIsCertified] = useState<boolean>(user.isCertified);

        const [editUser, setEditUser] = useState<UserResponse>({...user});

        const _handleOrganizationInfoEdit = async () => {
            setUser(({
                ...editUser,
                bio: editUser.bio,
                positionCoached: organizationName,
                yearsOfExperience: yearsOfExperience,
                isCertified: isCertified
            }));
            if (userSport.length === 0) {
                if (sportLevel === 0) {
                    Alert.alert('Please Skill Level');
                    return;
                }

                const convertedSportLevel = convertStringToEnumValue(SportLevel, sportLevel);
                if (convertedSportLevel === null)
                    return;
                setSelectedSports([...selectedSports,
                    {
                        sportId: selectedSport.id,
                        sportLevel: convertedSportLevel,
                        createAt: new Date(),
                        sportName: selectedSport.name
                    }]);
            }
            if (selectedSports.length === 0 && userSport.length === 0)
                return;
            await _handleContinue();
        }

        const _generateSportLevelItems = (): { label: string; value: string; key: string }[] => {
            return Object.keys(SportLevel).filter((key: string) => !isNaN(Number(SportLevel[key as keyof typeof SportLevel]))).map((key: string) => ({
                label: key,
                value: key,
                key: SportLevel[key as keyof typeof SportLevel].toString()
            }));
        };


        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <KeyboardAwareScrollView style={{flex: 1}}>
                        <View style={styles.formContainer}>
                            <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5}}>Organization
                                Details</Text>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Organization Name</Text>
                                <TextInput
                                    style={[styles.inputStyle, {paddingLeft: 0}]}
                                    placeholder={'Organization Name'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    underlineColor={"transparent"}
                                    value={organizationName}
                                    onChangeText={(text) => setOrganizationName(text)}
                                />
                                <Text style={styles.textLabel}>Admin Name</Text>
                                <TextInput
                                    style={[styles.inputStyle, {paddingLeft: 0}]}
                                    placeholder={'Admin Name'}
                                    disabled={true}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    underlineColor={"transparent"}
                                    value={`${userData?.firstName} ${userData?.lastName}`}
                                />
                                <Text style={styles.textLabel}>Age group</Text>


                                <View style={{marginTop: 30}}>
                                    <CustomButton text="Continue" onPress={() => {
                                    }}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        )
    }

    const OrganizationSport = () => {
        const [estimatedCost, setEstimatedCost] = useState<number>();
        const [selectedSport, setSelectedSport] = useState<any>();
        const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
        const [selectedTypeOfGame, setSelectedTypeOfGame] = useState<[]>([]);
        const [seasonDuration, setSeasonDuration] = useState<any>();
        const [location, setLocation] = useState<string>();
        const sportsList = sports
            .filter(sport => !selectedSport.find(x => x.id === sport.id))
            .map(sport => ({
                label: sport.name,
                value: sport.id,
                key: sport.id
            }));

        const [globalState, setGlobalState] = useState<UserInterestedSport[]>([]);


        const _handleAddAnotherSport = (): void => {
            const newEntry: UserInterestedSport = {
                typeOfGame: selectedTypeOfGame,
                seasonDuration: seasonDuration,
                estimatedCost: estimatedCost,
                sportName: selectedSport.name,
                sportLevel: SportLevel.Advance,
                createAt: new Date,
                sportId: selectedSport.id,
                locationOfGame: location,
                score: 0,
            };

            setGlobalState(prevState => [...prevState, newEntry]);

            setSelectedSport([]);
            setSelectedSport(undefined);
            setSeasonDuration(undefined);
            setEstimatedCost(0);
            setLocation(undefined);
        }

        const _handleSubmit = async (): Promise<void> => {

            //TODO:: Call the back end on sport intresst

        }

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <KeyboardAwareScrollView style={{flex: 1}}>
                        <View style={styles.formContainer}>
                            <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5}}>Sport
                                Info</Text>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Sport</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={sportsList}
                                    placeholder={{label: 'Select sport', value: null}}
                                    onValueChange={(value) => setSelectedSport(value)}
                                    value={selectedSport.value || null}
                                />
                                {/*Disable selected sports if found on user*/}
                                <Text style={styles.textLabel}>Estimated Cost</Text>
                                <TextInput
                                    style={styles.inputInfoStyle}
                                    placeholder={'Estimated Cost'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    value={estimatedCost?.toString()}
                                    keyboardType={"decimal-pad"}
                                    onChangeText={(value) => setEstimatedCost(Number(value))}
                                    underlineColor={"transparent"}
                                />
                                <Text style={styles.textLabel}>Type of Game</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={_typeOfGame}
                                    placeholder={{label: 'Select sport', value: null}}
                                    onValueChange={(value) => setSelectedTpeOfGame(value.value)}
                                    value={selectedTpeOfGame || null}
                                />
                                <Text style={styles.textLabel}>Season Duration</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={_seasonDuration}
                                    placeholder={{label: 'Season Duration', value: null}}
                                    onValueChange={(value) => setSeasonDuration(value.value)}
                                    value={seasonDuration || null}
                                />
                                <Text style={styles.textLabel}>Location(s) of Game</Text>
                                <RNPickerSelect
                                    style={{inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle}}
                                    items={_locationOfGame}
                                    placeholder={{label: 'Location(s) of Game', value: null}}
                                    onValueChange={(value) => setSeasonDuration(value.value)}
                                    value={seasonDuration || null}
                                />

                                <View style={{marginTop: 30}}>
                                    <CustomButton text="Add another sport" onPress={_handleAddAnotherSport}/>
                                    <CustomButton text="Finish" onPress={_handleSubmit}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        );
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
                    {currentStep === 2 && userData?.role != UserType[UserType.ORGANIZATION] && <UserGenderEdit/>}
                    {currentStep === 2 && userData?.role == UserType[UserType.ORGANIZATION] && <OrganizationInfoEdit/>}
                    {currentStep === 3 && userData?.role != UserType[UserType.ORGANIZATION] && <CoachSportInfoEdit/>}
                    {currentStep === 3 && userData?.role == UserType[UserType.ORGANIZATION] && <OrganizationSport/>}
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
        borderWidth: 1,
        paddingLeft: 15
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
        textAlign: 'left',
        // height: 120,
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