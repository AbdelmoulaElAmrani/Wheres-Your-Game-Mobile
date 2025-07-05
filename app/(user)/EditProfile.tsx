import CustomButton from "@/components/CustomButton";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Keyboard,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Platform,
    Modal,
    Image,
    ScrollView
} from "react-native"
import {ImageBackground} from "expo-image";
import {Avatar, Text, TextInput} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons, Octicons} from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import {router, useLocalSearchParams, useRouter} from "expo-router";
import Gender from "@/models/Gender";
import MaleIcon from "@/assets/images/svg/MaleIcon";
import FemaleIcon from "@/assets/images/svg/FemaleIcon";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {useDispatch, useSelector} from "react-redux";
import {getUserProfile, getUserSports, updateUserProfile} from "@/redux/UserSlice";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {DatePickerModal, enGB, registerTranslation, tr} from 'react-native-paper-dates';
import Sport from "@/models/Sport";
import RNPickerSelect from 'react-native-picker-select';
import {SportService} from "@/services/SportService";
import {UserService} from "@/services/UserService";
import SportLevel, {convertStringToEnumValue} from "@/models/SportLevel";
import {UserInterestedSport} from "@/models/UserInterestedSport";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {UserRequest} from "@/models/requestObjects/UserRequest";
import {manipulateAsync, SaveFormat} from "expo-image-manipulator";
import {StorageService} from "@/services/StorageService";
import UserType from "@/models/UserType";
import {MultiSelect} from "react-native-element-dropdown";
import { useAlert } from "@/utils/useAlert";
import StyledAlert from "@/components/StyledAlert";
import { AntDesign } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';


const pickerSelectStyle = {
    inputIOS: { 
        color: 'black',
        paddingVertical: 12,
        textAlignVertical: 'center' as const
    }, 
    inputAndroid: { 
        color: 'black', 
        height: 45 
    }, 
    placeholder: { 
        color: 'grey' 
    } 
};

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

const _countries = [
    {label: 'United States', value: 'United States', key: 'US'},
    {label: 'China', value: 'China', key: 'CN'},
    {label: 'India', value: 'India', key: 'IN'},
    {label: 'Japan', value: 'Japan', key: 'JP'},
    {label: 'Germany', value: 'Germany', key: 'DE'},
    {label: 'United Kingdom', value: 'United Kingdom', key: 'GB'},
    {label: 'France', value: 'France', key: 'FR'},
    {label: 'Italy', value: 'Italy', key: 'IT'},
    {label: 'Brazil', value: 'Brazil', key: 'BR'},
    {label: 'Canada', value: 'Canada', key: 'CA'},
    {label: 'Russia', value: 'Russia', key: 'RU'},
    {label: 'South Korea', value: 'South Korea', key: 'KR'},
    {label: 'Australia', value: 'Australia', key: 'AU'},
    {label: 'Spain', value: 'Spain', key: 'ES'},
    {label: 'Mexico', value: 'Mexico', key: 'MX'},
    {label: 'Indonesia', value: 'Indonesia', key: 'ID'},
    {label: 'Netherlands', value: 'Netherlands', key: 'NL'},
    {label: 'Saudi Arabia', value: 'Saudi Arabia', key: 'SA'},
    {label: 'Turkey', value: 'Turkey', key: 'TR'},
    {label: 'Switzerland', value: 'Switzerland', key: 'CH'},
    {label: 'Argentina', value: 'Argentina', key: 'AR'},
    {label: 'Sweden', value: 'Sweden', key: 'SE'},
    {label: 'Poland', value: 'Poland', key: 'PL'},
    {label: 'Belgium', value: 'Belgium', key: 'BE'},
    {label: 'Thailand', value: 'Thailand', key: 'TH'},
    {label: 'Nigeria', value: 'Nigeria', key: 'NG'},
    {label: 'Austria', value: 'Austria', key: 'AT'},
    {label: 'Iran', value: 'Iran', key: 'IR'},
    {label: 'Norway', value: 'Norway', key: 'NO'},
    {label: 'United Arab Emirates', value: 'United Arab Emirates', key: 'AE'},
    {label: 'South Africa', value: 'South Africa', key: 'ZA'},
    {label: 'Israel', value: 'Israel', key: 'IL'},
    {label: 'Denmark', value: 'Denmark', key: 'DK'},
    {label: 'Singapore', value: 'Singapore', key: 'SG'},
    {label: 'Malaysia', value: 'Malaysia', key: 'MY'},
    {label: 'Morocco', value: 'Morocco', key: 'MA'},
    {label: 'Philippines', value: 'Philippines', key: 'PH'},
    {label: 'Colombia', value: 'Colombia', key: 'CO'},
    {label: 'Pakistan', value: 'Pakistan', key: 'PK'},
    {label: 'Ireland', value: 'Ireland', key: 'IE'},
    {label: 'Chile', value: 'Chile', key: 'CL'},
    {label: 'Finland', value: 'Finland', key: 'FI'},
    {label: 'Egypt', value: 'Egypt', key: 'EG'},
    {label: 'Portugal', value: 'Portugal', key: 'PT'},
    {label: 'Vietnam', value: 'Vietnam', key: 'VN'},
    {label: 'Czech Republic', value: 'Czech Republic', key: 'CZ'},
    {label: 'Romania', value: 'Romania', key: 'RO'},
    {label: 'Bangladesh', value: 'Bangladesh', key: 'BD'},
    {label: 'New Zealand', value: 'New Zealand', key: 'NZ'},
    {label: 'Hungary', value: 'Hungary', key: 'HU'},
    {label: 'Other', value: 'Other', key: 'OTHER'}
];


const EditProfile = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const { showErrorAlert, showAlert, showStyledAlert, alertConfig, closeAlert } = useAlert();

    const _router = useRouter();

    const [sports, setSports] = useState<Sport[]>([]);
    const [selectedSports, setSelectedSports] = useState<UserInterestedSport[]>([]);

    const [user, setUser] = useState<UserResponse>({
        blockedByPrincipal: false, blockedByTheUser: false,
        ageGroup: [],
        city: "",
        country: "",
        followers: [],
        organizationName: "",
        preferenceSport: "",
        skillLevel: [],
        socialMediaLinks: undefined,
        stateRegion: "",
        visible: false,
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
        dateOfBirth: userData?.dateOfBirth || undefined,
        isCertified: false,
        positionCoached: "",
        yearsOfExperience: 0
    });

    type GenderOrNull = Gender | null;

    const paramData = useLocalSearchParams<any>();


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
        // Debug log after dispatch
    }, []);

    useEffect(() => {
        if (user?.id == '' || user?.id == undefined || user?.id != userData?.id) {
            setUser(userData);
        } else {
            dispatch(getUserSports(userData.id) as any);
        }
    }, [userData]);

    const _handleUpdateUser = async (selectedGender: GenderOrNull = null, bio: string = "", coachFields?: {
        yearsOfExperience?: number;
        positionCoached?: string;
        skillLevel?: any[];
        isCertified?: boolean;
        preferenceSport?: string;
    }) => {
        try {
            if (!user) {
                console.error('User is null, cannot update');
                return;
            }

            let updatedUser = {...user};
            if (selectedGender !== null) {
                updatedUser = {...updatedUser, gender: selectedGender};
            }
            if (bio !== undefined) {
                updatedUser = {...updatedUser, bio: bio};
            }
            if (coachFields) {
                if (coachFields.yearsOfExperience !== undefined) {
                    updatedUser = {...updatedUser, yearsOfExperience: coachFields.yearsOfExperience};
                }
                if (coachFields.positionCoached !== undefined) {
                    updatedUser = {...updatedUser, positionCoached: coachFields.positionCoached};
                }
                if (coachFields.skillLevel !== undefined) {
                    updatedUser = {...updatedUser, skillLevel: coachFields.skillLevel};
                }
                if (coachFields.isCertified !== undefined) {
                    updatedUser = {...updatedUser, isCertified: coachFields.isCertified};
                }
                if (coachFields.preferenceSport !== undefined) {
                    updatedUser = {...updatedUser, preferenceSport: coachFields.preferenceSport};
                }
            }
            
            // Sanitize the user data before sending to backend
            const userRequest = sanitizeUserForBackend(updatedUser);
       
            try {
                const result = await dispatch(updateUserProfile(userRequest) as any);
                
                if (result.error) {
                    const directResult = await UserService.updateUser(userRequest);
                    if (directResult) {
                        setUser(directResult);
                    }
                }
            } catch (reduxError) {
                try {
                    const directResult = await UserService.updateUser(userRequest);
                    if (directResult) {
                        setUser(directResult);
                    }
                } catch (apiError) {
                    console.error("Direct API call error:", apiError);
                }
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const _handleContinue = async (selectedGender: GenderOrNull = null, bio: string = "", coachFields?: {
        yearsOfExperience?: number;
        positionCoached?: string;
        skillLevel?: any[];
        isCertified?: boolean;
        preferenceSport?: string;
    }) => {
        if (userData?.role == UserType[UserType.COACH]) {
            setCurrentStep(oldValue => Math.min(3, oldValue + 1));
            if (currentStep >= 3) {
                try {
                    await _handleUpdateUser(selectedGender, bio, coachFields);
                    if (selectedSports.length > 0 && userSport.length === 0) {
                        const response = await SportService.registerUserToSport(selectedSports, userData.id);
                    }
                    router.replace('/(tabs)');
                    return;
                } catch (e) {
                    console.log(e);
                }
            }
        } else if (userData?.role == UserType[UserType.ORGANIZATION]) {
            setCurrentStep(oldValue => Math.min(4, oldValue + 1));
            if (currentStep >= 2) {
                try {
                } catch (e) {
                    console.log(e);
                }
            }
        } else {
            setCurrentStep(oldValue => Math.min(2, oldValue + 1));
            if (currentStep >= 2) {
                try {
                    await _handleUpdateUser(selectedGender, bio, coachFields);
                    let flag = false;
                    if (paramData?.data) {
                        flag = true;
                    }
                    _router.push({
                        pathname: '/SportInterested',
                        params: {data: flag ? 'profile' : null},
                    });
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
        // If editing from profile, use collapsible interface - return "Edit Profile"
        if (paramData?.data === 'profile') {
            return 'Edit Profile';
        }
        
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



    function formatDateInput(text: string) {
        let cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length > 2 && cleaned.length <= 4) {
            cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        } else if (cleaned.length > 4) {
            cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
        }
        return cleaned;
    }

    function formatDateForBackend(dateInput: string | Date | undefined): Date | null {
        console.log('formatDateForBackend input:', dateInput, typeof dateInput);
        
        if (!dateInput) {
            console.log('formatDateForBackend: no input, returning null');
            return null;
        }
        
        // If it's already a Date object, return it
        if (dateInput instanceof Date) {
            const isValid = !isNaN(dateInput.getTime());
            console.log('formatDateForBackend: Date object, valid:', isValid);
            return isValid ? dateInput : null;
        }
        
        // If it's a string, parse it
        if (typeof dateInput === 'string') {
            if (dateInput.trim() === '') {
                console.log('formatDateForBackend: empty string, returning null');
                return null;
            }
            
            console.log('formatDateForBackend: parsing string:', dateInput);
            
            // First, try to parse as ISO date string (from backend)
            if (dateInput.includes('T') || dateInput.includes('Z') || dateInput.includes('+')) {
                console.log('formatDateForBackend: attempting to parse as ISO date');
                const isoDate = new Date(dateInput);
                const isValid = !isNaN(isoDate.getTime());
                console.log('formatDateForBackend: ISO date parsed:', isoDate, 'valid:', isValid);
                if (isValid) {
                    return isoDate;
                }
            }
            
            // Handle YYYY-MM-DD format (from backend)
            if (dateInput.includes('-') && !dateInput.includes('/')) {
                console.log('formatDateForBackend: attempting to parse as YYYY-MM-DD date');
                const date = new Date(dateInput);
                const isValid = !isNaN(date.getTime());
                console.log('formatDateForBackend: YYYY-MM-DD date parsed:', date, 'valid:', isValid);
                if (isValid) {
                    return date;
                }
            }
            
            // Handle MM/DD/YYYY format (from user input)
            const parts = dateInput.split('/');
            console.log('formatDateForBackend: parts:', parts);
            
            if (parts.length === 3) {
                const [month, day, year] = parts;
                console.log('formatDateForBackend: month, day, year:', month, day, year);
                
                // Validate that we have valid numbers
                if (month && day && year && 
                    !isNaN(Number(month)) && !isNaN(Number(day)) && !isNaN(Number(year))) {
                    
                    // Validate reasonable date ranges
                    const monthNum = Number(month);
                    const dayNum = Number(day);
                    const yearNum = Number(year);
                    
                    // More strict validation for reasonable dates
                    if (monthNum >= 1 && monthNum <= 12 && 
                        dayNum >= 1 && dayNum <= 31 && 
                        yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
                        
                        // Additional validation for specific months
                        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
                        if (dayNum > daysInMonth) {
                            console.log('formatDateForBackend: day exceeds days in month');
                            return null;
                        }
                        
                        // Create Date object in YYYY-MM-DD format
                        const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        console.log('formatDateForBackend: creating date with string:', dateString);
                        
                        const date = new Date(dateString);
                        const isValid = !isNaN(date.getTime());
                        console.log('formatDateForBackend: created date:', date, 'valid:', isValid);
                        
                        if (isValid) {
                            return date;
                        }
                    } else {
                        console.log('formatDateForBackend: date values out of range');
                    }
                } else {
                    console.log('formatDateForBackend: invalid numbers in date parts');
                }
            } else {
                console.log('formatDateForBackend: wrong number of parts for MM/DD/YYYY format');
            }
        }
        
        console.log('formatDateForBackend: invalid format, returning null');
        return null;
    }

    function formatDateForDisplay(dateInput: string | Date | undefined): string {
        if (!dateInput) {
            return '';
        }
        
        let date: Date;
        
        if (dateInput instanceof Date) {
            date = dateInput;
        } else if (typeof dateInput === 'string') {
            // Try to parse the string as a date
            const parsedDate = new Date(dateInput);
            if (isNaN(parsedDate.getTime())) {
                return dateInput; // Return original string if parsing fails
            }
            date = parsedDate;
        } else {
            return '';
        }
        
        // Format as MM/DD/YYYY
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        
        return `${month}/${day}/${year}`;
    }

    function sanitizeUserForBackend(user: UserResponse): UserRequest {
        console.log('sanitizeUserForBackend: input user.dateOfBirth:', user.dateOfBirth, typeof user.dateOfBirth);
        
        const formattedDate = formatDateForBackend(user.dateOfBirth);
        console.log('sanitizeUserForBackend: formattedDate:', formattedDate);
        
        // Ensure date is in YYYY-MM-DD format for backend
        let finalDate: Date | null = null;
        if (formattedDate) {
            finalDate = formattedDate;
        } else if (user.dateOfBirth) {
            // If formatDateForBackend failed, try to parse the original date
            if (user.dateOfBirth instanceof Date) {
                finalDate = user.dateOfBirth;
            } else {
                // Handle string dates (MM/DD/YYYY format)
                const dateStr = user.dateOfBirth as string;
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        const [month, day, year] = parts;
                        const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        finalDate = new Date(dateString);
                    }
                } else {
                    // Try parsing as is
                    finalDate = new Date(dateStr);
                }
            }
        }
        
        // Validate the final date
        if (finalDate && isNaN(finalDate.getTime())) {
            console.log('sanitizeUserForBackend: Invalid date, using current date');
            finalDate = new Date();
        }
        
        const sanitizedUser = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            bio: user.bio || '',
            zipCode: user.zipCode || '',
            address: user.address || '',
            gender: user.gender,
            dateOfBirth: finalDate || new Date(),
            isCertified: user.isCertified || false,
            yearsOfExperience: user.yearsOfExperience || 0,
            positionCoached: user.positionCoached || '',
            ageGroup: user.ageGroup || [],
            skillLevel: Array.isArray(user.skillLevel) ? user.skillLevel.map(level => level.toString()) : [],
            country: user.country || '',
            stateRegion: user.stateRegion || '',
            city: user.city || '',
            preferenceSport: user.preferenceSport || ''
        };
        
        console.log('sanitizeUserForBackend: final dateOfBirth:', sanitizedUser.dateOfBirth, typeof sanitizedUser.dateOfBirth);
        console.log('sanitizeUserForBackend: email:', sanitizedUser.email);
        console.log('sanitizeUserForBackend: phoneNumber:', sanitizedUser.phoneNumber);
        return sanitizedUser;
    }

    const UserInfoEdit = () => {
        const [editUser, setEditUser] = useState<UserResponse>({...user});
        const [open, setOpen] = useState(false);

        const _handleEditProfilePic = async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.2
            });

            if (!result.canceled) {
                // Immediately update the preview with the selected image
                setEditUser(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
                
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
                    const imageUrl = await StorageService.upload(user.id, formData);
                    // Update with the server URL after successful upload
                    if (imageUrl) {
                        setEditUser(prev => ({ ...prev, imageUrl: imageUrl }));
                    }
                }).catch(err => {
                    console.error('Error during image manipulation:', err);
                    // Revert to original image if upload fails
                    setEditUser(prev => ({ ...prev, imageUrl: user.imageUrl }));
                });
            }
        };

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
                showErrorAlert(errors.join('\n'), closeAlert);
                setUser(oldValue => ({...editUser}));
                return;
            }
            setUser(oldValue => ({...editUser}));
            // Log the data being sent for update
            console.log('EditProfile: Saving user info', editUser);
            
            // If editing from profile, save and continue to next step
            if (paramData?.data === 'profile') {
                try {
                    await _handleUpdateUser(null, editUser.bio || '');
                    setCurrentStep(2); // Continue to step 2
                } catch (e) {
                    console.log(e);
                }
            } else {
                // Continue with registration flow
                await _handleContinue(null, editUser.bio || '');
            }
        }

        const _verifyUserInfo = (user: UserResponse): string[] => {
            const errors: string[] = [];
            
            // Only validate these fields when in profile edit mode
            if (paramData?.data === 'profile') {
                if (!user.firstName || user.firstName.trim() === '') {
                    errors.push('First name is required');
                }
                if (!user.lastName || user.lastName.trim() === '') {
                    errors.push('Last name is required');
                }
                if (!user.email || user.email.trim() === '') {
                    errors.push('Email is required');
                }
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
                            {/* Show the 4 fields only when editing profile from settings */}
                            {paramData?.data === 'profile' && (
                                <>
                                    <Text style={styles.textLabel}>First Name</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'First Name'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>}
                                        value={editUser.firstName}
                                        onChangeText={(text) => setEditUser({...editUser, firstName: text})}
                                        underlineStyle={{height: 0}}
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
                                        underlineStyle={{height: 0}}
                                    />
                                    <Text style={styles.textLabel}>Email</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Email'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='email-outline' size={30}/>}
                                        value={editUser.email}
                                        onChangeText={(text) => setEditUser({...editUser, email: text})}
                                        keyboardType="email-address"
                                        underlineStyle={{height: 0}}
                                    />
                                    <Text style={styles.textLabel}>Phone Number</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Phone Number'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='phone-outline' size={30}/>}
                                        value={editUser.phoneNumber}
                                        onChangeText={(text) => setEditUser({...editUser, phoneNumber: text})}
                                        keyboardType="phone-pad"
                                        underlineStyle={{height: 0}}
                                    />
                                </>
                            )}
                            
                            <Text style={styles.textLabel}>Date of Birth</Text>
                            <TouchableOpacity
                                style={styles.inputStyle}
                                onPress={() => setOpen(true)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
                                    <TextInput.Icon color={'#D3D3D3'} icon='calendar' size={30}/>
                                    <Text style={{ 
                                        color: formatDateForDisplay(editUser.dateOfBirth) ? 'black' : 'grey',
                                        fontSize: 16,
                                        flex: 1,
                                        marginLeft: 40
                                    }}>
                                        {formatDateForDisplay(editUser.dateOfBirth) || 'MM/DD/YYYY'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <DatePickerModal
                                locale="en"
                                mode="single"
                                visible={open}
                                onDismiss={() => setOpen(false)}
                                date={editUser.dateOfBirth ? new Date(editUser.dateOfBirth) : undefined}
                                onConfirm={({ date }) => {
                                    setOpen(false);
                                    if (date) {
                                        setEditUser({...editUser, dateOfBirth: date});
                                    }
                                }}
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
                                underlineStyle={{height: 0}}
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
                                underlineStyle={{height: 0}}
                            />
                            {userData?.role == UserType[UserType.ORGANIZATION] && <View style={{marginTop: 20}}>
                                <Text style={{textAlign: 'center', fontWeight: 'bold'}}>Note:</Text>
                                <Text style={{textAlign: 'center', fontWeight: 'bold'}}>If you're signing up for an organization, your info will be used as the admin. If you're not the admin, sign up as a coach and ask the admin to connect you to the organization.</Text>
                            </View>}
                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                    text={paramData?.data === 'profile' ? "Save & Continue" : "Save & Continue"}
                                    onPress={_handleContinueUserInfo}/>
                            </View>
                        </View>
                        {/* Hidden fields for required data - only when not in profile edit mode */}
                        {paramData?.data !== 'profile' && (
                            <View style={{ display: 'none' }}>
                                <TextInput
                                    value={editUser.firstName}
                                    onChangeText={(text) => setEditUser({ ...editUser, firstName: text })}
                                />
                                <TextInput
                                    value={editUser.lastName}
                                    onChangeText={(text) => setEditUser({ ...editUser, lastName: text })}
                                />
                                <TextInput
                                    value={editUser.email}
                                    onChangeText={(text) => setEditUser({ ...editUser, email: text })}
                                />
                                <TextInput
                                    value={editUser.phoneNumber}
                                    onChangeText={(text) => setEditUser({ ...editUser, phoneNumber: text })}
                                />
                            </View>
                        )}
                    </View>
                </KeyboardAwareScrollView>
            </>
        </TouchableWithoutFeedback>);
    }

    const UserGenderEdit = (() => {
        const [selectedGender, setSelectedGender] = useState(user?.gender === Gender.MALE || user?.gender === Gender.FEMALE ? user.gender : Gender.DEFAULT);

        useEffect(() => {
            setSelectedGender(user?.gender === Gender.MALE || user?.gender === Gender.FEMALE ? user.gender : Gender.DEFAULT);
        }, [user.gender, user]);

        const _handleContinueGenderEdit = async () => {
            if (selectedGender !== Gender.MALE && selectedGender !== Gender.FEMALE) {
                showErrorAlert('Please select your gender to continue.', closeAlert);
                return;
            }
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
                        textStyle={[styles.buttonText, {fontSize: 15, fontWeight: 'bold'}]}
                    />
                    <CustomButton
                        text="Save & Continue"
                        onPress={_handleContinueGenderEdit}
                        textStyle={{fontSize: 15, fontWeight: 'bold'}}
                        style={[styles.continueButton, {width: wp('42%'), marginRight: wp('5%')}]} 
                    />
                </View>
            </View>
        );
    });

    const ProfileGenderEdit = () => {
        const [selectedGender, setSelectedGender] = useState(user?.gender === Gender.MALE || user?.gender === Gender.FEMALE ? user.gender : Gender.DEFAULT);

        useEffect(() => {
            setSelectedGender(user?.gender === Gender.MALE || user?.gender === Gender.FEMALE ? user.gender : Gender.DEFAULT);
        }, [user.gender, user]);

        const _handleContinueGenderEdit = async () => {
            if (selectedGender !== Gender.MALE && selectedGender !== Gender.FEMALE) {
                showErrorAlert('Please select your gender to continue.', closeAlert);
                return;
            }
            setUser((prevEditUser) => ({...prevEditUser, gender: selectedGender}));
            
            // If editing from profile, save and continue to next step
            if (paramData?.data === 'profile') {
                try {
                    await _handleUpdateUser(selectedGender);
                    setCurrentStep(3);
                } catch (e) {
                    console.log(e);
                }
            } else {
                await _handleContinue(selectedGender);
            }
        };

        const genderOptions = [
            { label: 'Male', value: Gender.MALE },
            { label: 'Female', value: Gender.FEMALE }
        ];

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView style={{flex: 1}}>
                    <View style={styles.formContainer}>
                        <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5}}>Gender</Text>
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Select your gender</Text>
                            <View style={styles.inputStyle}>
                                <RNPickerSelect
                                    style={pickerSelectStyle}
                                    items={genderOptions}
                                    placeholder={{ label: 'Select gender...', value: null, color: '#aaa' }}
                                    onValueChange={(value) => setSelectedGender(value as Gender)}
                                    value={selectedGender}
                                    useNativeAndroidPickerStyle={false}
                                    Icon={() => (
                                        <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                    )}
                                />
                            </View>
                            <View style={{marginTop: 30, flexDirection: 'row', justifyContent: 'space-between'}}>
                                <CustomButton
                                    text="Back"
                                    onPress={goToPreviousStep}
                                    style={[styles.backButton, {width: wp('40%')}]}
                                    textStyle={[styles.buttonText, {fontSize: 15, fontWeight: 'bold'}]}
                                />
                                <CustomButton
                                    textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                    text="Save & Continue"
                                    onPress={_handleContinueGenderEdit}
                                    style={[styles.continueButton, {width: wp('40%')}]}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
        );
    };

    const CoachSportInfoEdit = () => {
        if (!user) {
            console.log('user is null' + new Date().toISOString());
            return null; // Return null if user is not available
        }
        
        const [selectedSport, setSelectedSport] = useState<Sport | null>(() => {
            // Initialize with existing user sport data if available
            if (userSport.length > 0) {
                return sports.find(sport => sport.id === userSport[0]?.sportId) || null;
            }
            return null;
        });
        const [positionCoach, setPositionCoach] = useState<string>(user?.positionCoached ?? '');
        const [sportLevel, setSportLevel] = useState<SportLevel>(() => {
            // Initialize with existing user skill level if available
            if (user?.skillLevel && user.skillLevel.length > 0) {
                const skillLevelString = user.skillLevel[0];
                const convertedLevel = convertStringToEnumValue(SportLevel, skillLevelString);
                return convertedLevel || SportLevel.Beginner;
            }
            // Fallback to userSport data if available
            if (userSport.length > 0) {
                return userSport[0]?.sportLevel || SportLevel.Beginner;
            }
            return SportLevel.Beginner;
        });
        const [yearsOfExperience, setYearsOfExperience] = useState<number>(user?.yearsOfExperience ?? 0);
        const [isCertified, setIsCertified] = useState<boolean>(user?.isCertified ?? false);

        const [editUser, setEditUser] = useState<UserResponse>({...user});

        // Update sportLevel when user data changes
        useEffect(() => {
            if (user?.skillLevel && user.skillLevel.length > 0) {
                const skillLevelString = user.skillLevel[0];
                const convertedLevel = convertStringToEnumValue(SportLevel, skillLevelString);
                if (convertedLevel) {
                    setSportLevel(convertedLevel);
                }
            }
        }, [user?.skillLevel]);

        const _handleCoachSportInfoEdit = async () => {
            // Check if user has existing sport data or has selected a new sport
            const hasExistingSport = userSport.length > 0;
            const hasSelectedSport = selectedSport !== null;
            
            if (!hasExistingSport && !hasSelectedSport) {
                showErrorAlert('Please select a sport', closeAlert);
                return;
            }
            
            if (!sportLevel) {
                showErrorAlert('Please select skill level', closeAlert);
                return;
            }
             
            setUser(({
                ...editUser,
                bio: editUser.bio,
                positionCoached: positionCoach,
                yearsOfExperience: yearsOfExperience,
                isCertified: isCertified,
                skillLevel: [sportLevel],
                preferenceSport: selectedSport?.name || ""
            }));
            console.log('EditProfile: Saving coach sport info', {
                ...editUser,
                bio: editUser.bio,
                positionCoached: positionCoach,
                yearsOfExperience: yearsOfExperience,
                isCertified: isCertified,
                skillLevel: [sportLevel?.toString() || ""],
                preferenceSport: selectedSport?.name || ""
            });
             
            if (userSport.length === 0) {
                const convertedSportLevel = convertStringToEnumValue(SportLevel, sportLevel);
                if (convertedSportLevel === null) return;
                
                setSelectedSports([...selectedSports,
                    {
                        sportId: selectedSport!.id,
                        sportLevel: convertedSportLevel,
                        createAt: new Date(),
                        sportName: selectedSport!.name
                    }]);
            }
            
            if (selectedSports.length === 0 && userSport.length === 0)
                return;
       
            await _handleContinue(null, editUser.bio || '', {
                yearsOfExperience: yearsOfExperience,
                positionCoached: positionCoach,
                skillLevel: [sportLevel?.toString() || ""],
                isCertified: isCertified,
                preferenceSport: selectedSport?.name || ""
            });
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
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={styles.textLabel}>Primary Sport</Text>
                                        <View style={styles.inputStyle}>
                                            <RNPickerSelect
                                                style={pickerSelectStyle}
                                                items={sports.map(sport => ({ label: sport.name, value: sport.id, key: sport.id }))}
                                                placeholder={{ label: 'Select sport...', value: null, color: '#aaa' }}
                                                onValueChange={(value) => setSelectedSport(sports.find(sport => sport.id === value) || null)}
                                                value={selectedSport?.id || null}
                                                useNativeAndroidPickerStyle={false}
                                                Icon={() => (
                                                    <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={styles.textLabel}>Coaching Position</Text>
                                        <TextInput
                                            style={[styles.inputStyle, { paddingLeft: 0 }]}
                                            placeholder={'e.g. Head Coach'}
                                            cursorColor='black'
                                            placeholderTextColor={'grey'}
                                            left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>} 
                                            underlineStyle={{height: 0}}
                                            value={positionCoach}
                                            onChangeText={(text) => setPositionCoach(text)}
                                        />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={styles.textLabel}>Skill Level</Text>
                                        <View style={styles.inputStyle}>
                                            <RNPickerSelect
                                                style={pickerSelectStyle}
                                                items={_generateSportLevelItems()}
                                                placeholder={{ label: 'Select skill level...', value: null, color: '#aaa' }}
                                                onValueChange={(value) => setSportLevel(value as SportLevel)}
                                                value={sportLevel?.toString() || null}
                                                useNativeAndroidPickerStyle={false}
                                                Icon={() => (
                                                    <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={styles.textLabel}>Years of Experience</Text>
                                        <TextInput
                                            style={styles.inputStyle}
                                            placeholder="e.g. 5"
                                            cursorColor="black"
                                            placeholderTextColor="grey"
                                            left={<TextInput.Icon color={'#D3D3D3'} icon='calendar' size={24} />}
                                            value={yearsOfExperience ? yearsOfExperience.toString() : ''}
                                            onChangeText={text => setYearsOfExperience(Number(text.replace(/[^0-9]/g, '')))}
                                            keyboardType="number-pad"
                                            underlineStyle={{height: 0}}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.textLabel}>Are you certified?</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={[{label: 'Yes', value: true, key: 'Yes'}, {label: 'No', value: false, key: 'No'}]}
                                        placeholder={{ label: 'e.g. Yes', value: null }}
                                        onValueChange={(value) => setIsCertified(value as boolean)}
                                        value={isCertified}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>
                                <Text style={styles.textLabel}>About You</Text>
                                <TextInput
                                    style={styles.inputInfoStyle}
                                    placeholder={'e.g. Former college athlete, now coaching youth teams'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='information-outline' size={24}/>} 
                                    value={editUser.bio}
                                    onChangeText={(text) => setEditUser({...editUser, bio: text})}
                                    underlineStyle={{height: 0}}
                                    multiline={true}
                                    numberOfLines={4}
                                />
                                <View style={{marginTop: 30}}>
                                    <CustomButton
                                        textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                        text="Save" onPress={_handleCoachSportInfoEdit}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        )
    }

    const CollapsibleSection = ({ title, children, isExpanded, onToggle }: {
        title: string;
        children: React.ReactNode;
        isExpanded: boolean;
        onToggle: () => void;
    }) => {
        const animatedHeight = useSharedValue(isExpanded ? 1 : 0);
        const animatedRotation = useSharedValue(isExpanded ? 1 : 0);

        useEffect(() => {
            animatedHeight.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
            animatedRotation.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
        }, [isExpanded]);

        const heightStyle = useAnimatedStyle(() => ({
            height: interpolate(animatedHeight.value, [0, 1], [0, 500]), // Adjust max height as needed
            opacity: animatedHeight.value,
        }));

        const rotationStyle = useAnimatedStyle(() => ({
            transform: [{ rotate: `${interpolate(animatedRotation.value, [0, 1], [0, 180])}deg` }],
        }));

        return (
            <View style={styles.collapsibleSection}>
                <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Animated.View style={rotationStyle}>
                        <AntDesign name="down" size={20} color="#2757CB" />
                    </Animated.View>
                </TouchableOpacity>
                <Animated.View style={[styles.sectionContent, heightStyle]}>
                    {children}
                </Animated.View>
            </View>
        );
    };

    const ProfileEditCollapsible = () => {
        if (!user) {
            console.log('user is null' + new Date().toISOString());
            return null;
        }

        const [expandedSections, setExpandedSections] = useState({
            personal: true,
            contact: false,
            sports: false
        });

        const [editUser, setEditUser] = useState<UserResponse>({...user});
        const [datePickerOpen, setDatePickerOpen] = useState(false);
        const [selectedGender, setSelectedGender] = useState(user?.gender === Gender.MALE || user?.gender === Gender.FEMALE ? user.gender : Gender.DEFAULT);
        const [selectedSport, setSelectedSport] = useState<Sport | null>(() => {
            if (userSport.length > 0) {
                return sports.find(sport => sport.id === userSport[0]?.sportId) || null;
            }
            return null;
        });
        const [positionCoach, setPositionCoach] = useState<string>(user?.positionCoached ?? '');
        const [sportLevel, setSportLevel] = useState<SportLevel>(() => {
            if (user?.skillLevel && user.skillLevel.length > 0) {
                const skillLevelString = user.skillLevel[0];
                const convertedLevel = convertStringToEnumValue(SportLevel, skillLevelString);
                return convertedLevel || SportLevel.Beginner;
            }
            if (userSport.length > 0) {
                return userSport[0]?.sportLevel || SportLevel.Beginner;
            }
            return SportLevel.Beginner;
        });
        const [yearsOfExperience, setYearsOfExperience] = useState<number>(user?.yearsOfExperience ?? 0);
        const [isCertified, setIsCertified] = useState<boolean>(user?.isCertified ?? false);

        const _handleEditProfilePic = async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.2
            });

            if (!result.canceled) {
                // Immediately update the preview with the selected image
                setEditUser(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
                
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
                    const imageUrl = await StorageService.upload(user.id, formData);
                    // Update with the server URL after successful upload
                    if (imageUrl) {
                        setEditUser(prev => ({ ...prev, imageUrl: imageUrl }));
                    }
                }).catch(err => {
                    console.error('Error during image manipulation:', err);
                    // Revert to original image if upload fails
                    setEditUser(prev => ({ ...prev, imageUrl: user.imageUrl }));
                });
            }
        };

        const toggleSection = (section: keyof typeof expandedSections) => {
            setExpandedSections(prev => {
                // If the clicked section is already expanded, collapse it
                if (prev[section]) {
                    return {
                        personal: false,
                        contact: false,
                        sports: false
                    };
                } else {
                    // If clicking a different section, expand only that one
                    return {
                        personal: section === 'personal',
                        contact: section === 'contact',
                        sports: section === 'sports'
                    };
                }
            });
        };

        const _handleSaveAll = async () => {
            try {
                console.log('ProfileEditCollapsible: Starting profile update...');
                
                // Validate required fields
                const errors: string[] = [];
                if (!editUser.firstName?.trim()) errors.push('First name is required');
                if (!editUser.lastName?.trim()) errors.push('Last name is required');
                
                if (errors.length > 0) {
                    showErrorAlert(errors.join('\n'), closeAlert);
                    return;
                }
                
                // Create updated user object with all the changes
                const updatedUser = {
                    ...editUser,
                    gender: selectedGender,
                    bio: editUser.bio || '',
                    yearsOfExperience: yearsOfExperience,
                    positionCoached: positionCoach,
                    skillLevel: sportLevel ? [sportLevel] : [],
                    isCertified: isCertified,
                    preferenceSport: selectedSport?.name || ""
                };
                
                console.log('ProfileEditCollapsible: Updated user data:', updatedUser);
                
                // Sanitize the user data before sending to backend
                const userRequest = sanitizeUserForBackend(updatedUser);
                
                // Update user profile directly
                const result = await UserService.updateUser(userRequest);
                
                console.log('ProfileEditCollapsible: Backend response:', result);
                
                if (result) {
                    console.log('ProfileEditCollapsible: Profile updated successfully');
                    console.log('ProfileEditCollapsible: Updated email:', result.email);
                    console.log('ProfileEditCollapsible: Updated phone:', result.phoneNumber);
                    setUser(result); // Update local state
                    
                    // Save sports changes for non-coach users
                    if (!isCoach && userData?.id) {
                        try {
                            // First, delete all existing user sports
                            console.log('ProfileEditCollapsible: Deleting all existing sports...');
                            await SportService.deleteAllUserSports(userData.id);
                            console.log('ProfileEditCollapsible: All existing sports deleted');
                            
                            // Then add the new sports from playerSports
                            if (playerSports.length > 0) {
                                // Convert playerSports to UserInterestedSport format
                                const sportsToSave = playerSports.map(sport => ({
                                    sportId: sport.sportId,
                                    sportName: sport.sportName,
                                    sportLevel: SportLevel.Beginner, // Default level since we don't store it in playerSports
                                    createAt: new Date(),
                                    typeOfGame: [],
                                    seasonDuration: undefined,
                                    estimatedCost: 0,
                                    locationOfGame: undefined,
                                    score: 0
                                }));
                                
                                console.log('ProfileEditCollapsible: Saving sports data:', sportsToSave);
                                await SportService.registerUserToSport(sportsToSave, userData.id);
                                console.log('ProfileEditCollapsible: Sports saved successfully');
                            }
                        } catch (sportError) {
                            console.error('ProfileEditCollapsible: Error saving sports:', sportError);
                            // Don't fail the entire save if sports fail
                        }
                    }
                    
                    // Refresh Redux store with fresh data from server
                    dispatch(getUserProfile() as any);
                    if (userData?.id) {
                        dispatch(getUserSports(userData.id) as any);
                    }
                    
                    // Show success confirmation
                    showAlert({
                        title: 'Success!',
                        message: 'Your profile has been updated successfully.',
                        onConfirm: () => {
                            // Navigate to Profile tab instead of going back
                            _router.replace('/(tabs)');
                        },
                        confirmText: 'OK'
                    });
                } else {
                    throw new Error('Failed to update profile - no response from server');
                }
                
            } catch (e) {
                console.error('ProfileEditCollapsible: Error updating profile:', e);
                
                // Show error message to user
                showErrorAlert(
                    'Failed to update profile. Please check your connection and try again.',
                    closeAlert
                );
            }
        };

        const _generateSportLevelItems = (): { label: string; value: string; key: string }[] => {
            return Object.keys(SportLevel).filter((key: string) => !isNaN(Number(SportLevel[key as keyof typeof SportLevel]))).map((key: string) => ({
                label: key,
                value: key,
                key: SportLevel[key as keyof typeof SportLevel].toString()
            }));
        };

        const genderOptions = [
            { label: 'Male', value: Gender.MALE },
            { label: 'Female', value: Gender.FEMALE }
        ];

        const isCoach = userData?.role === UserType[UserType.COACH] || userData?.role === 'COACH';
        // For player/other: local state for sports list
        const [playerSports, setPlayerSports] = useState<{ sportId: string, sportName: string, skillLevels: string[] }[]>(
            userSport
                .filter(s => !!s.sportId)
                .map(s => ({
                    sportId: s.sportId!,
                    sportName: s.sportName,
                    skillLevels: s.sportLevel ? [s.sportLevel.toString()] : []
                }))
        );
        // Modal state for adding sport
        const [addSportModalVisible, setAddSportModalVisible] = useState(false);
        // Modal state for delete confirmation
        const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
        const [sportToDelete, setSportToDelete] = useState<{ sportId: string, sportName: string } | null>(null);
        const [modalSelectedSport, setModalSelectedSport] = useState<Sport | null>(null);
        const [modalSelectedSkillLevels, setModalSelectedSkillLevels] = useState<string[]>([]);
        // Handler to add sport from modal
        const handleAddSportFromModal = () => {
            if (!modalSelectedSport || !modalSelectedSport.id) return;
            if (modalSelectedSkillLevels.length === 0) return;
            setPlayerSports(prev => [...prev, {
                sportId: String(modalSelectedSport.id),
                sportName: modalSelectedSport.name,
                skillLevels: [...modalSelectedSkillLevels]
            }]);
            setAddSportModalVisible(false);
            setModalSelectedSport(null);
            setModalSelectedSkillLevels([]);
        };
        // Handler to delete a sport
        const handleDeletePlayerSport = (sportId: string) => {
            const sportToDelete = playerSports.find(s => s.sportId === sportId);
            if (sportToDelete) {
                setSportToDelete({ sportId, sportName: sportToDelete.sportName });
                setDeleteConfirmModalVisible(true);
            }
        };
        // Handler to confirm delete
        const handleConfirmDelete = () => {
            if (sportToDelete) {
                setPlayerSports(prev => prev.filter(s => s.sportId !== sportToDelete.sportId));
                setDeleteConfirmModalVisible(false);
                setSportToDelete(null);
            }
        };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView style={{flex: 1}}>
                    <View style={styles.formContainer}>
                        {/* <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5, marginBottom: 20}}>Edit Profile</Text> */}
                        
                        {/* Personal Information Section */}
                        <CollapsibleSection
                            title="Personal Information"
                            isExpanded={expandedSections.personal}
                            onToggle={() => toggleSection('personal')}
                        >
                            <View style={styles.sectionFields}>
                                {/* Two Column Layout: Names on Left, Profile Picture on Right */}
                                <View style={styles.twoColumnLayout}>
                                    {/* Left Column - Name Fields */}
                                    <View style={styles.leftColumn}>
                                        <Text style={styles.textLabel}>First Name</Text>
                                        <TextInput
                                            style={styles.inputStyle}
                                            placeholder={'First Name'}
                                            cursorColor='black'
                                            placeholderTextColor={'grey'}
                                            left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>}
                                            value={editUser.firstName}
                                            onChangeText={(text) => setEditUser({...editUser, firstName: text})}
                                            underlineStyle={{height: 0}}
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
                                            underlineStyle={{height: 0}}
                                        />
                                    </View>
                                    
                                    {/* Right Column - Profile Picture */}
                                    <View style={styles.rightColumn}>
                                        <View style={styles.profileImageContainer}>
                                            {editUser.imageUrl ? (
                                                <Image 
                                                    source={{uri: editUser.imageUrl}} 
                                                    style={styles.profileImage}
                                                />
                                            ) : (
                                                <View style={styles.profilePlaceholder}>
                                                    <Text style={styles.profilePlaceholderText}>
                                                        {`${editUser.firstName[0] || ''}${editUser.lastName[0] || ''}`}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.changePhotoButton}
                                            onPress={_handleEditProfilePic}
                                        >
                                            <Text style={styles.changePhotoButtonText}>Change</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.textLabel}>Date of Birth</Text>
                                <TouchableOpacity
                                    style={styles.inputStyle}
                                    onPress={() => setDatePickerOpen(true)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
                                        <TextInput.Icon color={'#D3D3D3'} icon='calendar' size={30}/>
                                        <Text style={{ 
                                            color: formatDateForDisplay(editUser.dateOfBirth) ? 'black' : 'grey',
                                            fontSize: 16,
                                            flex: 1,
                                            marginLeft: 40
                                        }}>
                                            {formatDateForDisplay(editUser.dateOfBirth) || 'MM/DD/YYYY'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <DatePickerModal
                                    locale="en"
                                    mode="single"
                                    visible={datePickerOpen}
                                    onDismiss={() => setDatePickerOpen(false)}
                                    date={editUser.dateOfBirth ? new Date(editUser.dateOfBirth) : undefined}
                                    onConfirm={({ date }) => {
                                        setDatePickerOpen(false);
                                        if (date) {
                                            setEditUser({...editUser, dateOfBirth: date});
                                        }
                                    }}
                                />
                                <Text style={styles.textLabel}>Gender</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={genderOptions}
                                        placeholder={{ label: 'Select gender...', value: null, color: '#aaa' }}
                                        onValueChange={(value) => setSelectedGender(value as Gender)}
                                        value={selectedGender}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>
                            </View>
                        </CollapsibleSection>

                        {/* Contact Information Section */}
                        <CollapsibleSection
                            title="Contact Information"
                            isExpanded={expandedSections.contact}
                            onToggle={() => toggleSection('contact')}
                        >
                            <View style={styles.sectionFields}>
                                <Text style={styles.textLabel}>Email</Text>
                                <TextInput
                                    style={[styles.inputStyle, {backgroundColor: '#f5f5f5'}]}
                                    placeholder={'Email'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='email-outline' size={30}/>}
                                    value={editUser.email}
                                    editable={false}
                                    underlineStyle={{height: 0}}
                                />
                                <Text style={styles.textLabel}>Phone Number</Text>
                                <TextInput
                                    style={[styles.inputStyle, {backgroundColor: '#f5f5f5'}]}
                                    placeholder={'Phone Number'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='phone-outline' size={30}/>}
                                    value={editUser.phoneNumber}
                                    editable={false}
                                    underlineStyle={{height: 0}}
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
                                    underlineStyle={{height: 0}}
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
                                    underlineStyle={{height: 0}}
                                />
                            </View>
                        </CollapsibleSection>

                        {/* Sports Information Section */}
                        {isCoach && (
                        <CollapsibleSection
                            title="Sports Information"
                            isExpanded={expandedSections.sports}
                            onToggle={() => toggleSection('sports')}
                        >
                            <View style={styles.sectionFields}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={styles.textLabel}>Primary Sport</Text>
                                        <View style={styles.inputStyle}>
                                            <RNPickerSelect
                                                style={pickerSelectStyle}
                                                items={sports.map(sport => ({ label: sport.name, value: sport.id, key: sport.id }))}
                                                placeholder={{ label: 'Select sport...', value: null, color: '#aaa' }}
                                                onValueChange={(value) => setSelectedSport(sports.find(sport => sport.id === value) || null)}
                                                value={selectedSport?.id || null}
                                                useNativeAndroidPickerStyle={false}
                                                Icon={() => (
                                                    <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={styles.textLabel}>Coaching Position</Text>
                                        <TextInput
                                            style={[styles.inputStyle, { paddingLeft: 0 }]}
                                            placeholder={'e.g. Head Coach'}
                                            cursorColor='black'
                                            placeholderTextColor={'grey'}
                                            left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30}/>} 
                                            underlineStyle={{height: 0}}
                                            value={positionCoach}
                                            onChangeText={(text) => setPositionCoach(text)}
                                        />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={styles.textLabel}>Skill Level</Text>
                                        <View style={styles.inputStyle}>
                                            <RNPickerSelect
                                                style={pickerSelectStyle}
                                                items={_generateSportLevelItems()}
                                                placeholder={{ label: 'Select skill level...', value: null, color: '#aaa' }}
                                                onValueChange={(value) => setSportLevel(value as SportLevel)}
                                                value={sportLevel?.toString() || null}
                                                useNativeAndroidPickerStyle={false}
                                                Icon={() => (
                                                    <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={styles.textLabel}>Years of Experience</Text>
                                        <TextInput
                                            style={styles.inputStyle}
                                            placeholder="e.g. 5"
                                            cursorColor="black"
                                            placeholderTextColor="grey"
                                            left={<TextInput.Icon color={'#D3D3D3'} icon='calendar' size={24} />}
                                            value={yearsOfExperience ? yearsOfExperience.toString() : ''}
                                            onChangeText={text => setYearsOfExperience(Number(text.replace(/[^0-9]/g, '')))}
                                            keyboardType="number-pad"
                                            underlineStyle={{height: 0}}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.textLabel}>Are you certified?</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={[{label: 'Yes', value: true, key: 'Yes'}, {label: 'No', value: false, key: 'No'}]}
                                        placeholder={{ label: 'e.g. Yes', value: null }}
                                        onValueChange={(value) => setIsCertified(value as boolean)}
                                        value={isCertified}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>
                                <Text style={styles.textLabel}>About You</Text>
                                <TextInput
                                    style={styles.inputInfoStyle}
                                    placeholder={'e.g. Former college athlete, now coaching youth teams'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='information-outline' size={24}/>} 
                                    value={editUser.bio}
                                    onChangeText={(text) => setEditUser({...editUser, bio: text})}
                                    underlineStyle={{height: 0}}
                                    multiline={true}
                                    numberOfLines={4}
                                />
                            </View>
                        </CollapsibleSection>
                        )}

                        {/* Sports List for non-coach users */}
                        {!isCoach && (
                            <CollapsibleSection
                                title="Your Sports"
                                isExpanded={expandedSections.sports}
                                onToggle={() => toggleSection('sports')}
                            >
                                <View style={styles.sectionFields}>
                                    {/* Table header */}
                                    <View style={{flexDirection: 'row', backgroundColor: '#f0f4fa', paddingVertical: 8, borderRadius: 8, marginBottom: 8}}>
                                        <Text style={[styles.textLabel, {flex: 2, fontWeight: 'bold'}]}>Sport</Text>
                                        <Text style={[styles.textLabel, {flex: 2, fontWeight: 'bold'}]}>Skill Level(s)</Text>
                                        <View style={{flex: 1}} />
                                    </View>
                                    {playerSports.length === 0 ? (
                                        <Text style={{color: 'grey', textAlign: 'center'}}>No sports added.</Text>
                                    ) : (
                                        playerSports.map((sport) => (
                                            <View key={sport.sportId} style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, paddingVertical: 8, paddingHorizontal: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1}}>
                                                <Text style={[styles.textLabel, {flex: 2}]}>{sport.sportName}</Text>
                                                <Text style={[styles.textLabel, {flex: 2}]}>{sport.skillLevels.join(', ')}</Text>
                                                <TouchableOpacity style={{flex: 1, alignItems: 'flex-end'}} onPress={() => handleDeletePlayerSport(sport.sportId)}>
                                                    <AntDesign name="delete" size={20} color="red" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    )}
                                    <CustomButton textStyle={{fontSize: 15, fontWeight: 'bold'}} text="Add Sport" onPress={() => setAddSportModalVisible(true)} />
                                </View>
                                {/* Add Sport Modal */}
                                <Modal
                                    visible={addSportModalVisible}
                                    transparent
                                    animationType="slide"
                                    onRequestClose={() => setAddSportModalVisible(false)}
                                >
                                    <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                                        <View style={{backgroundColor: 'white', borderRadius: 20, padding: 20, width: '85%'}}>
                                            <Text style={[styles.textLabel, {marginBottom: 10}]}>Select Sport</Text>
                                            <View style={styles.inputStyle}>
                                                <RNPickerSelect
                                                    style={pickerSelectStyle}
                                                    items={sports.map(sport => ({ label: sport.name, value: sport.id, key: sport.id }))}
                                                    placeholder={{ label: 'Select sport...', value: null, color: '#aaa' }}
                                                    onValueChange={(value) => setModalSelectedSport(sports.find(sport => sport.id === value) || null)}
                                                    value={modalSelectedSport?.id || null}
                                                    useNativeAndroidPickerStyle={false}
                                                    Icon={() => (
                                                        <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                                    )}
                                                />
                                            </View>
                                            <Text style={[styles.textLabel, {marginTop: 15}]}>Skill Level(s)</Text>
                                            <View style={{marginTop: 10, marginBottom: 20}}>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10 }}>
                                                    {_generateSportLevelItems().map((item) => {
                                                        const value = item.value;
                                                        const isSelected = modalSelectedSkillLevels.includes(value);
                                                        return (
                                                            <TouchableOpacity
                                                                key={item.key}
                                                                style={[
                                                                    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 10, marginBottom: 10 },
                                                                    isSelected ? { backgroundColor: '#4564f5' } : { backgroundColor: '#f2f4fb' }
                                                                ]}
                                                                onPress={() => {
                                                                    setModalSelectedSkillLevels((prev: string[]) => {
                                                                        if (prev.includes(value)) {
                                                                            return prev.filter(level => level !== value);
                                                                        } else {
                                                                            return [...prev, value];
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: isSelected ? 'white' : 'black' }}>
                                                                    {item.label}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </View>
                                            <CustomButton textStyle={{fontSize: 15, fontWeight: 'bold'}} text="Add" onPress={handleAddSportFromModal} />
                                            <CustomButton textStyle={{fontSize: 15, fontWeight: 'bold'}} text="Cancel" onPress={() => setAddSportModalVisible(false)} style={{marginTop: 10, backgroundColor: '#eee'}} />
                                        </View>
                                    </View>
                                </Modal>
                                {/* Delete Confirmation Modal */}
                                <Modal
                                    visible={deleteConfirmModalVisible}
                                    transparent
                                    animationType="slide"
                                    onRequestClose={() => setDeleteConfirmModalVisible(false)}
                                >
                                    <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                                        <View style={{backgroundColor: 'white', borderRadius: 20, padding: 20, width: '85%'}}>
                                            <Text style={[styles.textLabel, {marginBottom: 10}]}>Confirm Delete</Text>
                                            <Text style={[styles.textLabel, {marginBottom: 20}]}>Are you sure you want to delete {sportToDelete?.sportName}?</Text>
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                <CustomButton
                                                    textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                                    text="Yes"
                                                    onPress={handleConfirmDelete}
                                                    style={{width: wp('40%')}}
                                                />
                                                <CustomButton
                                                    textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                                    text="No"
                                                    onPress={() => setDeleteConfirmModalVisible(false)}
                                                    style={{width: wp('40%')}}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            </CollapsibleSection>
                        )}

                        <View style={{marginTop: 30}}>
                            <CustomButton
                                textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                text="Save All Changes"
                                onPress={_handleSaveAll}/>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
        );
    };


    const OrganizationInfoEdit = () => {

        const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
        const [organizationName, setOrganizationName] = useState<string>(user.organizationName || '');
        const [selectedSportLevel, setSelectedSportLevel] = useState<any[]>(user.skillLevel || []);
        const [selectedAgeGroup, setSelectedAgeGroup] = useState<string[]>(user.ageGroup || []);
        const [editUser, setEditUser] = useState<UserResponse>({...user});

        const _handleOrganizationInfoEdit = async () => {
            if (selectedSportLevel.length === 0) {
                showErrorAlert('Please select skill level', closeAlert);
                return;
            }
            setUser(({
                ...editUser,
                bio: editUser.bio,
                organizationName: organizationName,
                ageGroup: selectedAgeGroup,
                skillLevel: selectedSportLevel,
                country: editUser.country,
                stateRegion: editUser.stateRegion,
                city: editUser.city
            }));


            if (userSport.length === 0) {
                const convertedSportLevel = convertStringToEnumValue(SportLevel, selectedSportLevel[0]);

                if (convertedSportLevel === null)
                    return;

                setSelectedSports([...selectedSports,
                    {
                        sportId: selectedSport?.id,
                        sportLevel: convertedSportLevel,
                        createAt: new Date(),
                        sportName: selectedSport?.name
                    }]);
            }
            //this condition is not working because we are seting the global state
            // if (selectedSports.length === 0 && userSport.length === 0)
            //     return;


            await _handleContinue(null, editUser.bio || '');
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
                                    underlineStyle={{height: 0}}
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
                                    underlineStyle={{height: 0}}
                                    value={`${userData?.firstName} ${userData?.lastName}`}
                                />
                                <Text style={styles.textLabel}>Age group</Text>
                                {/*TODO:: Multi selection*/}
                                <MultiSelect
                                    style={styles.inputStyle}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    containerStyle={styles.containerStyle}
                                    data={_AgeGroup}
                                    placeholder={selectedAgeGroup.length > 0 ? `Selected ${selectedAgeGroup.map((item) => item).join(', ')}` : 'Select Age Group'}
                                    value={selectedAgeGroup}
                                    labelField="label"
                                    valueField="value"
                                    onChange={item => {
                                        setSelectedAgeGroup(item);
                                    }
                                    }
                                    iconStyle={styles.iconStyle}
                                    selectedStyle={styles.selectedStyle}
                                    activeColor='#4564f5'
                                    visibleSelectedItem={false}
                                />
                                <Text style={styles.textLabel}>Skill Level</Text>
                                {/*TODO:: Multi selection*/}
                                <MultiSelect
                                    style={styles.inputStyle}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    containerStyle={styles.containerStyle}
                                    data={_generateSportLevelItems()}
                                    placeholder={selectedSportLevel.length > 0 ? `Selected ${selectedSportLevel.map((item) => item).join(', ')}` : 'Select Skill Level'}
                                    value={selectedSportLevel}
                                    labelField="label"
                                    valueField="value"
                                    onChange={item => {
                                        setSelectedSportLevel(item);
                                    }}
                                    iconStyle={styles.iconStyle}
                                    selectedStyle={styles.selectedStyle}
                                    activeColor='#4564f5'
                                    visibleSelectedItem={false}
                                />
                                <Text style={styles.textLabel}>Tell us about yourself</Text>
                                <TextInput
                                    style={styles.inputInfoStyle}
                                    placeholder={'Tell us about yourself'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    value={editUser.bio}
                                    onChangeText={(text) => setEditUser({...editUser, bio: text})}
                                    underlineStyle={{height: 0}}
                                    multiline={true}
                                    numberOfLines={4}
                                />
                                <Text style={styles.textLabel}>Country</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={_countries}
                                        placeholder={{ label: 'Select country', value: null }}
                                        onValueChange={(value) => setEditUser({...editUser, country: value})}
                                        value={editUser?.country || 'United States'}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>
                                <Text style={styles.textLabel}>State/Region</Text>
                                <TextInput
                                    style={[styles.inputStyle, {paddingLeft: 0}]}
                                    placeholder={'State/Region'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    underlineStyle={{height: 0}}
                                    value={editUser.stateRegion}
                                    onChangeText={(text) => setEditUser({...editUser, stateRegion: text})}
                                />
                                <Text style={styles.textLabel}>City</Text>
                                <TextInput
                                    style={[styles.inputStyle, {paddingLeft: 0}]}
                                    placeholder={'City'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    underlineStyle={{height: 0}}
                                    value={editUser.city}
                                    onChangeText={(text) => setEditUser({...editUser, city: text})}
                                />
                                <View style={{marginTop: 30}}>
                                    <CustomButton
                                        textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                        text="Save & Continue" onPress={_handleOrganizationInfoEdit}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        )
    }

    const OrganizationSport = () => {
        const [estimatedCost, setEstimatedCost] = useState<string>('');
        const [selectedSport, setSelectedSport] = useState<any>();
        const [selectedSports, setSelectedSports] = useState<any>(userSport);
        const [selectedTypeOfGame, setSelectedTypeOfGame] = useState<Array<string>>([]);
        const [seasonDuration, setSeasonDuration] = useState<any>();
        const [location, setLocation] = useState<string>();
        const [sportsList, setSportsList] = useState<any>([]);

        const costRanges = [
            { label: '0 to 50', value: '0-50' },
            { label: '50 to 100', value: '50-100' },
            { label: '100 to 150', value: '100-150' },
            { label: '150 to 200', value: '150-200' },
            { label: '200+', value: '200+' }
        ];

        useEffect(() => {
            const filteredSportsList = sports
                .filter(sport => !selectedSports.find((selected: any) => selected.id === sport.id))
                .map(sport => ({
                    label: sport.name,
                    value: sport.id,
                    key: sport.id
                }));
            setSportsList(filteredSportsList);
        }, [selectedSports]);


        const [globalState, setGlobalState] = useState<UserInterestedSport[]>([]);


        const _handleAddAnotherSport = (): UserInterestedSport | null | undefined => {
            if (!selectedSport) {
                showErrorAlert('Please select a sport', closeAlert);
                return null;
            } else if (userSport.length > 0 && !selectedSport) {
                return null;
            }
            setSelectedSports([...selectedSports, selectedSport]);
            const newEntry: UserInterestedSport = {
                typeOfGame: selectedTypeOfGame,
                seasonDuration: seasonDuration,
                estimatedCost: Number(estimatedCost.split('-')[0] || estimatedCost.replace('+', '')), // Convert range to number
                sportName: selectedSport.name,
                sportLevel: SportLevel.Advance,
                createAt: new Date(),
                sportId: selectedSport?.id,
                locationOfGame: location,
                score: 0,
            };
            setGlobalState((value: UserInterestedSport[]) => {
                const updatedState = [...value, newEntry];
                return updatedState;
            });
            setSelectedSport(undefined);
            setSelectedTypeOfGame([]);
            setSeasonDuration(undefined);
            setEstimatedCost('');
            setLocation(undefined);
            return newEntry;
        };

        const _handleSubmit = async (): Promise<void> => {
            const res = _handleAddAnotherSport();
            if (!res) {
                _handleUpdateUser();
                router.replace('/(tabs)');
            }

            try {
                const updatedGlobalState = await new Promise<UserInterestedSport[]>((resolve) =>
                    setGlobalState((prevState: UserInterestedSport[]) => {
                        const newState = [...prevState];
                        resolve(newState);
                        return newState;
                    })
                );

                if (updatedGlobalState.length > 0) {
                    await SportService.registerUserToSport(updatedGlobalState, userData.id);

                }
                await _handleUpdateUser();
                router.replace('/(tabs)');


            } catch (e) {
                console.log(e);
            }
        };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <KeyboardAwareScrollView style={{flex: 1}}>
                        <View style={styles.formContainer}>
                            <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold', marginTop: 5}}>Sport
                                Info</Text>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Sport</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={sportsList}
                                        placeholder={{ label: 'Select sport', value: null }}
                                        onValueChange={(value) =>
                                            setSelectedSport(sports.find(sport => sport.id === value) || null)
                                        }
                                        value={selectedSport?.value}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>
                                <Text style={styles.textLabel}>Estimated Cost</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={costRanges}
                                        placeholder={{ label: 'Select cost range', value: null }}
                                        onValueChange={(value) => setEstimatedCost(value)}
                                        value={estimatedCost}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>
                                <Text style={styles.textLabel}>Type of Game</Text>
                                <MultiSelect
                                    style={styles.inputStyle}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    containerStyle={styles.containerStyle}
                                    data={_typeOfGame}
                                    placeholder={selectedTypeOfGame.length > 0 ? `Selected ${selectedTypeOfGame.map((item) => item).join(', ')}` : 'Select Type of Game'}
                                    value={selectedTypeOfGame}
                                    labelField="label"
                                    valueField="value"
                                    onChange={item => {
                                        setSelectedTypeOfGame(item);
                                    }}
                                    iconStyle={styles.iconStyle}
                                    selectedStyle={styles.selectedStyle}
                                    activeColor='#4564f5'
                                    visibleSelectedItem={false}
                                />
                                <Text style={styles.textLabel}>Season Duration</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={_seasonDuration}
                                        placeholder={{ label: 'Season Duration', value: null }}
                                        onValueChange={(value) => setSeasonDuration(value)}
                                        value={seasonDuration || null}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>
                                <Text style={styles.textLabel}>Location(s) of Game</Text>
                                <View style={styles.inputStyle}>
                                    <RNPickerSelect
                                        style={pickerSelectStyle}
                                        items={_locationOfGame}
                                        placeholder={{ label: 'Location(s) of Game', value: null }}
                                        onValueChange={(value) => setLocation(value)}
                                        value={location || null}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => (
                                            <AntDesign name="down" size={20} color="grey" style={{ position: 'absolute', right: 10, top: 12 }} />
                                        )}
                                    />
                                </View>

                                <View style={{marginTop: 20}}>
                                    <CustomButton
                                        textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                        text="Add another sport" onPress={_handleAddAnotherSport}/>
                                    <CustomButton
                                        textStyle={{fontSize: 15, fontWeight: 'bold'}}
                                        text="Finish" onPress={_handleSubmit} style={{marginTop: 10}}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </>
            </TouchableWithoutFeedback>
        );
    }


    // Guard against null user
    if (!user) {
        return (
            <ImageBackground
                style={StyleSheet.absoluteFill}
                source={require('../../assets/images/signupBackGround.jpg')}>
                <SafeAreaView style={{flex: 1}}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: 'white', fontSize: 18}}>Loading user data...</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
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
                {paramData?.data === 'profile' ? (
                    // Use collapsible interface for profile editing
                    <ProfileEditCollapsible />
                ) : (
                    // Use step-based interface for registration/onboarding
                    <>
                        <Text style={styles.stepText}>Step {currentStep}/3</Text>
                        <View style={styles.cardContainer}>
                            {currentStep === 1 && <UserInfoEdit/>}
                            {currentStep === 2 && userData?.role != UserType[UserType.ORGANIZATION] && <UserGenderEdit/>}
                            {currentStep === 2 && userData?.role == UserType[UserType.ORGANIZATION] && <OrganizationInfoEdit/>}
                            {currentStep === 3 && userData?.role != UserType[UserType.ORGANIZATION] && <CoachSportInfoEdit/>}
                            {currentStep === 3 && userData?.role == UserType[UserType.ORGANIZATION] && <OrganizationSport/>}
                        </View>
                    </>
                )}
                <StyledAlert
                    visible={showStyledAlert}
                    config={alertConfig}
                    onClose={closeAlert}
                />
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        height: hp('70%'),
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 40,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        marginTop: hp(10),
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
        bottom: 10,
        justifyContent: 'space-between',
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
        marginRight: wp(3)
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
    },
    placeholderStyle: {
        color: 'grey',
        fontSize: 16
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: 'grey',
        borderRadius: 10
    },
    containerStyle: {
        borderRadius: 15,
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconStyle: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    selectedStyle: {
        borderRadius: 15,
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 0.3,
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.25,
        shadowRadius: 2.50,
        elevation: 5
    },
    collapsibleSection: {
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 10,
        overflow: 'hidden',
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionContent: {
        padding: 15,
    },
    sectionFields: {
        marginBottom: 15,
    },
    modernProfileContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImageContainer: {
        marginBottom: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#2757CB',
    },
    profilePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2757CB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#2757CB',
    },
    profilePlaceholderText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    changePhotoButton: {
        backgroundColor: '#2757CB',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2757CB',
    },
    changePhotoButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    twoColumnLayout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    leftColumn: {
        flex: 1,
        marginRight: 15,
    },
    rightColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
})


export default EditProfile;