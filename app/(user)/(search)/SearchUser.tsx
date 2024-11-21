import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView, Platform,
    StyleSheet,
    Text,
    TouchableOpacity, TouchableWithoutFeedback,
    View
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router, useLocalSearchParams} from "expo-router";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Avatar, Modal, Searchbar} from "react-native-paper";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {UserService} from "@/services/UserService";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {Ionicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {FriendRequestService} from "@/services/FriendRequestService";
import {ChildrenService} from "@/services/ChildrenService";
import PhoneInput from "react-native-phone-number-input";
import {InvitationService} from "@/services/InvitationService";
import OverlaySpinner from "@/components/OverlaySpinner";
import * as SMS from 'expo-sms';


interface InviteObject {
    phoneNumber: string;
    confirmPhoneNumber: string;
    countryCode: string;
    confirmCountryCode: string;
}

const SearchUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isParenting, setParenting] = useState<boolean>(false);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [searchType, setSearchType] = useState<UserType>();
    const params = useLocalSearchParams<any>();
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [enableInvite, setEnableInvite] = useState<boolean>(false);
    const [inviteObject, setInviteObject] = useState<InviteObject>({
        confirmCountryCode: "",
        countryCode: "",
        phoneNumber: '', confirmPhoneNumber: ''
    });
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [searchName, setSearchName] = useState<string>('');
    const [people, setPeople] = useState<UserSearchResponse[]>([]);
    const phoneInput = useRef<PhoneInput>(null);
    const phoneInputConfirm = useRef<PhoneInput>(null);

    useEffect(() => {
        const param = params?.searchType as keyof typeof UserType | undefined;
        if (param) {
            const userTypeValue = UserType[param];
            // @ts-ignore
            const isDefault = param == UserType.DEFAULT;
            setParenting(isDefault);

            setSearchType(isDefault ? UserType.PLAYER : userTypeValue);
        } else {
            console.warn("Invalid or undefined searchType parameter");
        }
    }, [params?.searchType]);

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
            //TODO:: call the search for pareting
            data = await UserService.SearchUsersByFullName(searchName, searchType);
        } else {
            data = await UserService.SearchUsersByFullName(searchName, searchType);
        }
        if (data)
            setPeople(data);
        else
            setPeople([]);
        setLoading(false);
    }, [searchName, searchType]);

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
                Alert.alert('Error', 'Failed to send parenting request. Please try again.');
                return;
            }
            Alert.alert(
                'Invitation Sent',
                'Your parenting request has been sent successfully.',
                [{text: 'OK', onPress: () => console.log('Alert closed')}]
            );
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
            Alert.alert('Error', 'Failed to send parenting request. Please try again.');
        }
    }

    const _renderUserItem = ({item}: { item: UserSearchResponse }) => {
        return (
            <TouchableOpacity style={styles.userItem}>
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
                {((!item.friend && !isParenting) || (isParenting && !item.parent && !item.parentPending)) ?
                    <Ionicons
                        onPress={() => isParenting ? _onSendingParentingRequest(item.id) : _onAddFriendOrRemove(item.id)}
                        name="person-add-outline" size={20} color="black"/>
                    :
                    <Ionicons name="person-sharp" size={20} color="#2757CB"/>
                }
            </TouchableOpacity>
        );
    }

    const _onOpenInviteChildModal = () => {
        setModalVisible(true);
    };

    const _hideModal = () => {
        setModalVisible(false);
        setEnableInvite(false);
        setInviteObject({
            confirmCountryCode: "",
            countryCode: "",
            phoneNumber: '',
            confirmPhoneNumber: ''
        });
    }
    const _handleInvite = async () => {
        try {
            const message = await InvitationService.sendInvitation(inviteObject);

            if (message === undefined) {
                Alert.alert(
                    "Error",
                    "Something went wrong. Unable to send the invitation.",
                    [
                        {
                            text: "OK",
                            onPress: () => _hideModal() // Disable the invite button
                        }
                    ]
                );
            } else {
                setErrorMessage(""); // Clear any existing errors
                Alert.alert(
                    "Invitation Sent",
                    message,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                _hideModal();
                                _sendSmsInvitation(inviteObject.countryCode + inviteObject.phoneNumber);
                            }
                        }
                    ]
                );
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
        const {phoneNumber, confirmPhoneNumber, countryCode, confirmCountryCode} = updatedInviteObject;
        const isPhoneNumberValid = phoneInput.current?.isValidNumber(phoneNumber);
        const isConfirmPhoneNumberValid = phoneInputConfirm.current?.isValidNumber(confirmPhoneNumber);

        if (!isPhoneNumberValid) {
            setErrorMessage('Invalid primary phone number format.');
            setEnableInvite(false);
            return;
        }

        if (!isConfirmPhoneNumberValid) {
            setErrorMessage('Invalid confirm phone number format.');
            setEnableInvite(false);
            return;
        }
        if (countryCode !== confirmCountryCode) {
            setErrorMessage('Country codes do not match.');
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
                        {isParenting && <View style={{alignItems: 'flex-end'}}>
                            <TouchableOpacity
                                onPress={_onOpenInviteChildModal}
                                style={{
                                    backgroundColor: '#2757CB',
                                    width: 100,
                                    paddingVertical: 4,
                                    borderRadius: 10
                                }}>
                                <Text
                                    style={{color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Invite
                                    Child</Text>
                            </TouchableOpacity>
                        </View>}
                        <View style={{width: '100%', marginBottom: 30, flex: 1}}>
                            {people.length > 0 ? <FlatList
                                data={people}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={_renderUserItem}
                                style={styles.userList}
                                ListFooterComponent={<View style={{height: heightPercentageToDP(80)}}/>}
                            /> : <Text
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    marginTop: heightPercentageToDP(30)
                                }}>No
                                User</Text>}
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
                                <PhoneInput
                                    ref={phoneInputConfirm}
                                    defaultCode="US"
                                    layout="first"
                                    withDarkTheme
                                    placeholder="Confirm phone number"
                                    value={inviteObject.confirmPhoneNumber}
                                    onChangeText={(text) => handleInputChange("confirmPhoneNumber", text)}
                                    containerStyle={styles.inputStyle}
                                    textContainerStyle={styles.textPhoneInputContainer}
                                    onChangeCountry={(country) => handleInputChange("confirmCountryCode", country.callingCode[0])}
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
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 10

    },
    textPhoneInputContainer: {
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        backgroundColor: 'white',
        height: 50,
    },
    phoneCodeTextStyle: {
        color: 'grey',
        fontSize: 17,
    },
    phoneInputTextStyle: {
        color: 'grey',
        fontSize: 17,
        height: 50,
        marginTop: 4

    }
});
export default SearchUser;