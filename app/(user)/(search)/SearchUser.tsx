import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router, useLocalSearchParams, useFocusEffect} from "expo-router";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Avatar, Modal, Searchbar} from "react-native-paper";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {UserService} from "@/services/UserService";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {UserSearchResponse} from "@/models/responseObjects/UserSearchResponse";
import UserType from "@/models/UserType";
import {Ionicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {FriendRequestService} from "@/services/FriendRequestService";
import {ChildrenService} from "@/services/ChildrenService";
import PhoneInput from "react-native-phone-number-input";
import {InvitationService} from "@/services/InvitationService";
import OverlaySpinner from "@/components/OverlaySpinner";
import * as SMS from 'expo-sms';
import {OrganizationService} from "@/services/OrganizationService";
import { useAlert } from "@/utils/useAlert";
import StyledAlert from "@/components/StyledAlert";


interface InviteObject {
    phoneNumber: string;
    countryCode: string;
}

const SearchUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isParenting, setParenting] = useState<boolean>(false);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [searchType, setSearchType] = useState<UserType>();
    const params = useLocalSearchParams<any>();
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [isTutorialModalVisible, setTutorialModalVisible] = useState<boolean>(false);
    const [tutorialStep, setTutorialStep] = useState<number>(1);
    const [enableInvite, setEnableInvite] = useState<boolean>(false);
    const [inviteObject, setInviteObject] = useState<InviteObject>({
        countryCode: "",
        phoneNumber: ''
    });
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [searchName, setSearchName] = useState<string>('');
    const [people, setPeople] = useState<UserSearchResponse[]>([]);
    const phoneInput = useRef<PhoneInput>(null);
    const { showErrorAlert, showSuccessAlert, showConfirmationAlert, showStyledAlert, alertConfig, closeAlert } = useAlert();

    useEffect(() => {
        const param = params?.searchType as keyof typeof UserType | undefined;
        if (param) {
            const userTypeValue = UserType[param];
            // @ts-ignore
            const isDefault = param == UserType.DEFAULT;
            const isParent = userTypeValue === UserType.PARENT;
            setParenting(isParent);

            setSearchType(isDefault ? UserType.PLAYER : userTypeValue);
        } else {
            console.warn("Invalid or undefined searchType parameter");
        }
    }, [params?.searchType]);

    // Add empty search on mount
    useEffect(() => {
        const performEmptySearch = async () => {
            if (searchType) {
                setLoading(true);
                const data = await UserService.SearchUsersByFullName('', searchType);
                if (data) {
                    setPeople(data);
                } else {
                    setPeople([]);
                }
                setLoading(false);
            }
        };
        performEmptySearch();
    }, [searchType]);

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    const _sendSmsInvitation = async (phoneNumber: string) => {
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
            const appLink =
                Platform.OS === 'android'
                    ? 'https://play.google.com/store/apps/details?id=com.digiboost.sportgames'
                    : 'https://apps.apple.com/us/app/wheres-your-game/id6502469400';
            const invitationMessage = `Hi! Join me on "Where's Your Game" to connect, play, and train. Download here: ${appLink}`;
            try {
                await SMS.sendSMSAsync(phoneNumber, invitationMessage);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const _onSearchSubmit = useCallback(async () => {
        if (searchName.trim() === '') {
            if (people.length > 0) setPeople([]);
            return;
        }
        let data: UserSearchResponse[] | undefined;
        setLoading(true);
        if (isParenting) {
            data = await UserService.SearchUsersByFullName(searchName, UserType.PLAYER, isParenting);
        } else {
            data = await UserService.SearchUsersByFullName(searchName, searchType);
        }
        if (data)
            setPeople(data);
        else
            setPeople([]);
        setLoading(false);
    }, [searchName, searchType]);

    const _onSendRequest = async (receiverId: string) => {
        if (isParenting) {
            await _onSendingParentingRequest(receiverId);
        } else {
            if (currentUser?.role == UserType[UserType.ORGANIZATION] && searchType == UserType.COACH) {
                await _onSendInvitationToCoachFromOrganization(receiverId);
            } else {
                await _onAddFriendOrRemove(receiverId);
            }
        }
    }
    const _onSendInvitationToCoachFromOrganization = async (coachId: string) => {
        const res : boolean = await OrganizationService.sendCoachInviteRequest(coachId);
        if (!res) {
            showErrorAlert('Failed to send the invitation request. Please try again.', closeAlert);
            return;
        }
        showSuccessAlert('Your invitation request has been sent successfully to the coach.', closeAlert);
        setPeople((oldPeople) =>
            oldPeople.map((person) =>
                person.id === coachId ? { ...person, coachPending: true } : person
            )
        );
    }
    const _onAddFriendOrRemove = async (receiverId: string) => {
        const senderId = currentUser.id;
        const d = await FriendRequestService.sendFriendRequest(senderId, receiverId);
        setPeople(oldPeople => {
            return oldPeople.map(person => {
                if (person.id === receiverId) {
                    return {...person, friend: true};
                }
                return person;
            });
        });
    };

    const _onSendingParentingRequest = async (receiverId: string) => {
        try {
            const res = await ChildrenService.sendParentRequest(receiverId);
            if (!res) {
                showErrorAlert('Failed to send parenting request. Please try again.', closeAlert);
                return;
            }
            showSuccessAlert('Your parenting request has been sent successfully.', closeAlert);
            setPeople(oldPeople => {
                return oldPeople.map(person => {
                    if (person.id === receiverId) {
                        return {...person, parentPending: true};
                    }
                    return person;
                });
            });
        } catch (error) {
            console.error('Error sending parenting request:', error);
            showErrorAlert('Failed to send parenting request. Please try again.', closeAlert);
        }
    }

    const _renderUserItem = ({item}: { item: UserSearchResponse }) => {
        const canSendRequest = (((searchType == UserType.COACH && currentUser.role == UserType[UserType.ORGANIZATION]) && (!item.yourCoach && !item.coachPending))
        || (isParenting && !item.parent && !item.parentPending) || (!isParenting && !(searchType == UserType.COACH && currentUser.role == UserType[UserType.ORGANIZATION]) && !item.friend))
        return (
            <View style={styles.userItem}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {item.imageUrl ? (
                        <Avatar.Image size={35} source={{uri: item.imageUrl}}/>
                    ) : (
                        <Avatar.Text
                            size={35}
                            label={(item?.firstName?.charAt(0) + item?.lastName?.charAt(0)).toUpperCase()}
                        />
                    )}
                    <Text style={styles.userName}>{`${item.firstName} ${item.lastName}`}</Text>
                </View>
                {canSendRequest ?
                    <Ionicons
                        onPress={() => _onSendRequest(item.id)}
                        name="person-add-outline" size={20} color="black"/>
                    :
                    <Ionicons name="person-sharp" size={20} color="#2757CB"/>
                }
            </View>
        );
    }

    const _onOpenInviteChildModal = () => {
        // Initialize with US country code (+1) since defaultCode is "US"
        setInviteObject({
            countryCode: "1",
            phoneNumber: ''
        });
        setModalVisible(true);
    };

    const _onOpenTutorialModal = () => {
        console.log('Opening tutorial modal');
        setTutorialModalVisible(true);
        setTutorialStep(1);
    };

    const _hideModal = () => {
        setModalVisible(false);
        setEnableInvite(false);
        setErrorMessage('');
        setInviteObject({
            countryCode: "",
            phoneNumber: ''
        });
    }

    const _handleTutorialNext = () => {
        if (tutorialStep < 3) {
            setTutorialStep(tutorialStep + 1);
        } else {
            setTutorialModalVisible(false);
        }
    }

    const _handleTutorialClose = () => {
        setTutorialModalVisible(false);
    }
    const _handleInvite = async () => {
        try {
            // Clean phone number - remove all non-digit characters
            const cleanedPhoneNumber = inviteObject.phoneNumber.replace(/\D/g, '');
            
            // Get country code from phone input component or state, default to "1" (US)
            let countryCode = inviteObject.countryCode;
            if (!countryCode || countryCode.trim() === '') {
                // Try to get from phone input component
                const phoneInputCountry = phoneInput.current?.getCallingCode();
                countryCode = phoneInputCountry || "1";
            }
            
            // Validate that we have a phone number
            if (!cleanedPhoneNumber || cleanedPhoneNumber.trim() === '') {
                setErrorMessage('Please enter a valid phone number.');
                setEnableInvite(false);
                return;
            }
            
            // Validate minimum length
            if (cleanedPhoneNumber.length < 7) {
                setErrorMessage('Please enter a complete phone number.');
                setEnableInvite(false);
                return;
            }
            
            // Validate country code
            if (!countryCode || countryCode.trim() === '') {
                setErrorMessage('Please select a country code.');
                setEnableInvite(false);
                return;
            }
            
            // Prepare the invitation request with cleaned data
            const invitationRequest = {
                countryCode: countryCode.trim(),
                phoneNumber: cleanedPhoneNumber.trim()
            };
            
            // Log user role for debugging
            console.log('=== INVITATION REQUEST DEBUG ===');
            console.log('Current User Role:', currentUser?.role);
            console.log('Current User ID:', currentUser?.id);
            console.log('Current User Email:', currentUser?.email);
            console.log('UserType.PARENT value:', UserType[UserType.PARENT]);
            console.log('Is Parent?', currentUser?.role === UserType[UserType.PARENT]);
            console.log('Sending invitation with:', invitationRequest);
            console.log('================================');
            
            const message = await InvitationService.sendInvitation(invitationRequest);

            if (message === undefined) {
                showErrorAlert('Something went wrong. Unable to send the invitation.', closeAlert);
                _hideModal();
            } else {
                setErrorMessage(""); // Clear any existing errors
                showSuccessAlert(message, closeAlert);
                _hideModal();
                _sendSmsInvitation(countryCode + cleanedPhoneNumber);
            }
        } catch (error) {
            console.error("Error sending invitation:", error);
            setErrorMessage("An unexpected error occurred. Please try again later.");
            setEnableInvite(false);
        }
    }
    const handleInputChange = (field: keyof InviteObject, value: string): void => {
        const updatedInviteObject = {...inviteObject, [field]: value};
        setInviteObject(updatedInviteObject);
        const {phoneNumber, countryCode} = updatedInviteObject;
        
        // Use country code from state, default to "1" (US) if not set
        const currentCountryCode = countryCode || "1";
        
        // Check if phone number has minimum length (at least 7 digits)
        const phoneDigitsOnly = phoneNumber.replace(/\D/g, '');
        if (phoneDigitsOnly.length < 7) {
            setErrorMessage('Please enter a valid phone number.');
            setEnableInvite(false);
            return;
        }
        
        // Try to validate with the library, but be more lenient
        const isPhoneNumberValid = phoneInput.current?.isValidNumber(phoneNumber);
        
        // If library validation fails but we have enough digits, still allow it
        // (some formats might not be recognized but are still valid)
        if (!isPhoneNumberValid && phoneDigitsOnly.length < 10) {
            setErrorMessage('Please enter a complete phone number.');
            setEnableInvite(false);
            return;
        }
        
        setErrorMessage('');
        setEnableInvite(true);
    };

    return (
        <ImageBackground
            style={{
                flex: 1,
                width: '100%',
            }}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                {loading && (
                    <OverlaySpinner visible={loading}/>
                )}
                <CustomNavigationHeader
                    text={isParenting ? 'Add a Child' : `Search ${searchType ? UserType[searchType] : ''}`}
                    goBackFunction={_handleGoBack}
                    showBackArrow
                />

                <View style={styles.searchBarContainer}>
                    <Searchbar
                        placeholder='Search name | email'
                        onChangeText={(value) => setSearchName(value)}
                        value={searchName}
                        onSubmitEditing={_onSearchSubmit}
                        returnKeyType='search'
                        clearButtonMode="while-editing"
                        placeholderTextColor="#808080"
                        iconColor="#808080"
                        style={styles.searchBar}
                    />
                </View>
                <View style={styles.mainContainer}>
                    <KeyboardAvoidingView
                        style={{width: '100%', height: '100%', paddingVertical: 10, paddingHorizontal: 8, flex: 1}}>
                        {isParenting && <View style={styles.inviteButtonsContainer}>
                            <TouchableOpacity
                                onPress={_onOpenTutorialModal}
                                style={styles.howItWorksButton}>
                                <Ionicons name="information-circle-outline" size={18} color="#2757CB" style={{marginRight: 5}} />
                                <Text style={styles.howItWorksButtonText}>How it works</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onOpenInviteChildModal}
                                style={styles.inviteChildButton}>
                                <Text style={styles.inviteChildButtonText}>Invite Child</Text>
                            </TouchableOpacity>
                        </View>}
                        <View style={{width: '100%', marginBottom: 30, flex: 1}}>
                            {people.length > 0 ? <FlatList
                                    data={people}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={_renderUserItem}
                                    style={styles.userList}
                                    ListFooterComponent={<View style={{height: heightPercentageToDP(80)}}/>}
                                /> :
                                <>
                                    <Text style={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        marginTop: heightPercentageToDP(30)
                                    }}>
                                        {isParenting && (
                                            <Text style={{
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: 16
                                            }}>Your child account could be set to private.
                                            </Text>)}
                                    </Text>
                                    {!isParenting && (
                                        <Text style={{
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                        }}>No User</Text>)}</>}
                        </View>
                    </KeyboardAvoidingView>
                </View>

                <Modal visible={isModalVisible} onDismiss={_hideModal}
                       contentContainerStyle={styles.modalContainer}>
                    <TouchableWithoutFeedback style={{justifyContent: 'center', alignItems: 'center'}}
                                              onPress={Keyboard.dismiss}>
                        <View style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', paddingVertical: 20}}>Invite child by
                                phone
                                number</Text>
                            <View style={{width: '90%', alignItems: 'center', marginTop: 10}}>
                                <PhoneInput
                                    ref={phoneInput}
                                    defaultCode="US"
                                    layout="first"
                                    withDarkTheme
                                    placeholder="Phone number"
                                    value={inviteObject.phoneNumber}
                                    onChangeText={(text) => handleInputChange("phoneNumber", text)}
                                    containerStyle={styles.inputStyle}
                                    textContainerStyle={styles.textPhoneInputContainer}
                                    onChangeCountry={(country) => handleInputChange("countryCode", country.callingCode[0])}
                                    codeTextStyle={styles.phoneCodeTextStyle}
                                    textInputStyle={styles.phoneInputTextStyle}
                                />
                                {errorMessage ? (
                                    <Text
                                        style={{
                                            color: 'red',
                                            marginTop: 5,
                                            textAlign: 'center'
                                        }}>{errorMessage}</Text>
                                ) : null}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '80%',
                                    marginTop: 20
                                }}>
                                    <TouchableOpacity
                                        disabled={!enableInvite}
                                        onPress={_handleInvite}
                                        style={{
                                            backgroundColor: enableInvite ? '#2757CB' : 'grey',
                                            width: 100,
                                            paddingVertical: 4,
                                            borderRadius: 10
                                        }}>
                                        <Text style={{
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                            textAlign: 'center'
                                        }}>Invite</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={_hideModal}
                                        style={{
                                            backgroundColor: 'white',
                                            width: 100,
                                            paddingVertical: 4,
                                            borderRadius: 10,
                                            borderWidth: 1
                                        }}>
                                        <Text style={{
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                            textAlign: 'center'
                                        }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <StyledAlert
                    visible={showStyledAlert}
                    config={alertConfig}
                    onClose={closeAlert}
                />

                {/* Tutorial Modal */}
                <Modal 
                    visible={isTutorialModalVisible} 
                    onDismiss={_handleTutorialClose}
                    dismissable={true}
                    contentContainerStyle={styles.tutorialModalContainer}
                >
                    <View style={styles.tutorialModalWrapper}>
                        {/* Header */}
                        <View style={styles.tutorialHeader}>
                            <Text style={styles.tutorialTitle}>How to Invite a Child</Text>
                            <TouchableOpacity onPress={_handleTutorialClose} style={styles.tutorialCloseButton}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Scrollable Content */}
                        <ScrollView 
                            style={styles.tutorialScrollView}
                            contentContainerStyle={styles.tutorialScrollContent}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            {/* Step Indicator */}
                            <View style={styles.stepIndicatorContainer}>
                                {[1, 2, 3].map((step) => (
                                    <View key={step} style={styles.stepIndicatorWrapper}>
                                        <View style={[
                                            styles.stepIndicator,
                                            tutorialStep >= step && styles.stepIndicatorActive
                                        ]}>
                                            <Text style={[
                                                styles.stepIndicatorText,
                                                tutorialStep >= step && styles.stepIndicatorTextActive
                                            ]}>
                                                {step}
                                            </Text>
                                        </View>
                                        {step < 3 && (
                                            <View style={[
                                                styles.stepConnector,
                                                tutorialStep > step && styles.stepConnectorActive
                                            ]} />
                                        )}
                                    </View>
                                ))}
                            </View>

                            {/* Step Content */}
                            <View style={styles.tutorialStepContent}>
                                {tutorialStep === 1 && (
                                    <View style={styles.stepView}>
                                        <View style={styles.stepIconContainer}>
                                            <Ionicons name="person-add" size={50} color="#2757CB" />
                                        </View>
                                        <Text style={styles.stepTitle}>Step 1: Invite Your Child</Text>
                                        <Text style={styles.stepDescription}>
                                            You can invite your child in two ways:
                                        </Text>
                                        <View style={styles.stepBulletContainer}>
                                            <View style={styles.bulletPoint}>
                                                <Ionicons name="checkmark-circle" size={20} color="#2757CB" style={styles.bulletIcon} />
                                                <Text style={styles.bulletText}>
                                                    <Text style={styles.bulletBold}>If your child has an account:</Text> Search by name or email and send an invite
                                                </Text>
                                            </View>
                                            <View style={styles.bulletPoint}>
                                                <Ionicons name="checkmark-circle" size={20} color="#2757CB" style={styles.bulletIcon} />
                                                <Text style={styles.bulletText}>
                                                    <Text style={styles.bulletBold}>If your child doesn't have an account:</Text> Create an account for them or invite by phone number
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {tutorialStep === 2 && (
                                    <View style={styles.stepView}>
                                        <View style={styles.stepIconContainer}>
                                            <Ionicons name="settings" size={50} color="#2757CB" />
                                        </View>
                                        <Text style={styles.stepTitle}>Step 2: Privacy Settings</Text>
                                        <Text style={styles.stepDescription}>
                                            Your child must update their privacy settings to appear in search results.
                                        </Text>
                                        <View style={styles.stepBulletContainer}>
                                            <View style={styles.bulletPoint}>
                                                <Ionicons name="information-circle" size={20} color="#2757CB" style={styles.bulletIcon} />
                                                <Text style={styles.bulletText}>
                                                    Go to <Text style={styles.bulletBold}>Settings → Privacy</Text>
                                                </Text>
                                            </View>
                                            <View style={styles.bulletPoint}>
                                                <Ionicons name="information-circle" size={20} color="#2757CB" style={styles.bulletIcon} />
                                                <Text style={styles.bulletText}>
                                                    Enable <Text style={styles.bulletBold}>"Appear in Search Results"</Text>
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {tutorialStep === 3 && (
                                    <View style={styles.stepView}>
                                        <View style={styles.stepIconContainer}>
                                            <Ionicons name="checkmark-done-circle" size={50} color="#2757CB" />
                                        </View>
                                        <Text style={styles.stepTitle}>Step 3: Approve the Invite</Text>
                                        <Text style={styles.stepDescription}>
                                            Once your child receives the invite, they need to approve it.
                                        </Text>
                                        <View style={styles.stepBulletContainer}>
                                            <View style={styles.bulletPoint}>
                                                <Ionicons name="notifications" size={20} color="#2757CB" style={styles.bulletIcon} />
                                                <Text style={styles.bulletText}>
                                                    Your child will receive a <Text style={styles.bulletBold}>notification</Text>
                                                </Text>
                                            </View>
                                            <View style={styles.bulletPoint}>
                                                <Ionicons name="checkmark-circle" size={20} color="#2757CB" style={styles.bulletIcon} />
                                                <Text style={styles.bulletText}>
                                                    They can <Text style={styles.bulletBold}>accept or decline</Text> the request
                                                </Text>
                                            </View>
                                            <View style={styles.bulletPoint}>
                                                <Ionicons name="people" size={20} color="#2757CB" style={styles.bulletIcon} />
                                                <Text style={styles.bulletText}>
                                                    Once approved, they'll be added to your <Text style={styles.bulletBold}>children list</Text>
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        {/* Navigation Buttons - Fixed at bottom */}
                        <View style={styles.tutorialButtons}>
                            <TouchableOpacity
                                onPress={_handleTutorialClose}
                                style={styles.tutorialButtonSecondary}
                            >
                                <Text style={styles.tutorialButtonSecondaryText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_handleTutorialNext}
                                style={styles.tutorialButtonPrimary}
                            >
                                <Text style={styles.tutorialButtonPrimaryText}>
                                    {tutorialStep === 3 ? 'Got it!' : 'Next'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 5,
        width: '100%',
        height: '80%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    userList: {
        marginTop: 20,
    },
    userItem: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: heightPercentageToDP(1),
        justifyContent: 'space-between'
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: widthPercentageToDP(2)
    },
    searchBar: {
        backgroundColor: 'white'
    },
    searchBarContainer: {
        padding: 20,
        justifyContent: 'center'
    },
    inviteButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 10,
        gap: 10,
    },
    howItWorksButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#2757CB',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        flex: 1,
    },
    howItWorksButtonText: {
        color: '#2757CB',
        fontWeight: 'bold',
        fontSize: 14,
    },
    inviteChildButton: {
        backgroundColor: '#2757CB',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        flex: 1,
    },
    inviteChildButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 5,
        width: '95%',
        height: '30%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
        marginBottom: '30%'
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 63,
        fontSize: 16,
        marginTop: 10,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        width: '100%',
        marginBottom: 10,
    },
    textPhoneInputContainer: {
        color: 'black',
        backgroundColor: 'white',
        height: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    phoneCodeTextStyle: {
        color: 'grey',
        fontSize: 17,
        textAlignVertical: 'center',
        height: '100%'
    },
    phoneInputTextStyle: {
        color: 'grey',
        fontSize: 17,
        height: '100%',
        textAlignVertical: 'center',
    },
    // Tutorial Modal Styles
    tutorialModalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 0,
        width: '90%',
        maxHeight: heightPercentageToDP(80),
        alignSelf: 'center',
        margin: heightPercentageToDP(5),
        minHeight: heightPercentageToDP(40),
    },
    tutorialModalWrapper: {
        borderRadius: 20,
    },
    tutorialModalContent: {
        padding: 20,
    },
    tutorialScrollView: {
        flexGrow: 1,
        flexShrink: 1,
    },
    tutorialScrollContent: {
        paddingBottom: 10,
        paddingHorizontal: 5,
    },
    tutorialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tutorialTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2757CB',
        flex: 1,
        marginRight: 10,
    },
    tutorialCloseButton: {
        padding: 5,
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    stepIndicatorWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    stepIndicatorActive: {
        backgroundColor: '#2757CB',
        borderColor: '#2757CB',
    },
    stepIndicatorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#999',
    },
    stepIndicatorTextActive: {
        color: 'white',
    },
    stepConnector: {
        width: 40,
        height: 2,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 5,
    },
    stepConnectorActive: {
        backgroundColor: '#2757CB',
    },
    tutorialStepContent: {
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    stepView: {
        alignItems: 'center',
    },
    stepIconContainer: {
        marginBottom: 15,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2757CB',
        marginBottom: 10,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    stepDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    stepBulletContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    bulletPoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    bulletIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    bulletText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        flex: 1,
        flexWrap: 'wrap',
    },
    bulletBold: {
        fontWeight: 'bold',
        color: '#2757CB',
    },
    tutorialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: 'white',
    },
    tutorialButtonSecondary: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#2757CB',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
        minHeight: 48,
        justifyContent: 'center',
    },
    tutorialButtonSecondaryText: {
        color: '#2757CB',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tutorialButtonPrimary: {
        backgroundColor: '#2757CB',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
        minHeight: 48,
        justifyContent: 'center',
    },
    tutorialButtonPrimaryText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
export default SearchUser;