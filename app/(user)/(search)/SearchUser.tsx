import {Alert, FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router, useLocalSearchParams} from "expo-router";
import React, {useCallback, useEffect, useState} from "react";
import {Avatar, Modal, Searchbar} from "react-native-paper";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import Spinner from "@/components/Spinner";
import {UserService} from "@/services/UserService";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {Ionicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {FriendRequestService} from "@/services/FriendRequestService";
import {Helpers} from "@/constants/Helpers";
import {ChildrenService} from "@/services/ChildrenService";


interface InviteObject {
    phoneNumber: string;
    confirmPhoneNumber: string;
}

const SearchUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isParenting, setParenting] = useState<boolean>(false);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [searchType, setSearchType] = useState<UserType>();
    const params = useLocalSearchParams<any>();
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [enableInvite, setEnableInvite] = useState<boolean>(false);
    const [inviteObject, setInviteObject] = useState<InviteObject>({phoneNumber: '', confirmPhoneNumber: ''})
    const [errorMessage, setErrorMessage] = useState<string>('');

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

    const [searchName, setSearchName] = useState<string>('');
    const [people, setPeople] = useState<UserSearchResponse[]>([]);

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
        //TODO:: make sure to alert a message to the user that the invite has been set successfully
        try {
            const senderId = currentUser.id;
            //const d = await FriendRequestService.sendParentingRequest(senderId, receiverId);
            Alert.alert(
                'Invitation Sent',
                'Your parenting request has been sent successfully.',
                [{text: 'OK', onPress: () => console.log('Alert closed')}]
            );
            /*setPeople(oldPeople => {
                        return oldPeople.map(person => {
                            if (person.id === receiverId) {
                                return {...person, friend: true};
                            }
                            return person;
                        });
                    });*/
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
                {(!item.friend || (!item.parent && isParenting)) ?
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
    };
    const _handleInvite = async () => {
        const response = await ChildrenService.sendParentInvite(inviteObject);
    };


    const handleInputChange = (field: keyof InviteObject, value: string): void => {
        const updatedInviteObject = {...inviteObject, [field]: value};
        setInviteObject(updatedInviteObject);
        Helpers
        // Validation logic
        const {phoneNumber, confirmPhoneNumber} = updatedInviteObject;
        if (Helpers.validatePhoneNumber(phoneNumber) && phoneNumber === confirmPhoneNumber) {
            setErrorMessage('');
            setEnableInvite(true);
        } else if (phoneNumber !== confirmPhoneNumber) {
            setErrorMessage('The phone numbers do not match.');
            setEnableInvite(false);
        } else {
            setErrorMessage('Invalid phone number format.');
            setEnableInvite(false);
        }
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
                    <Spinner visible={loading}/>
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
                                style={{backgroundColor: '#2757CB', width: 100, paddingVertical: 4, borderRadius: 10}}>
                                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Invite
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
                                style={{textAlign: 'center', fontWeight: 'bold', marginTop: heightPercentageToDP(30)}}>No
                                User</Text>}
                        </View>
                    </KeyboardAvoidingView>
                </View>

                <Modal visible={isModalVisible} onDismiss={_hideModal}
                       contentContainerStyle={styles.modalContainer}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', paddingVertical: 20}}>Invite child by phone
                        number</Text>
                    <View style={{width: '90%', alignItems: 'center', marginTop: 10}}>
                        <TextInput
                            keyboardType={"phone-pad"}
                            placeholder="Your child's phone number"
                            style={[styles.inputStyle, {
                                marginTop: 10,
                                flexShrink: 1,  // Prevents wrapping
                                width: '100%',
                                height: 40,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            multiline={false}
                            onChangeText={(text) => handleInputChange('phoneNumber', text)}
                            value={inviteObject.confirmPhoneNumber}
                        />
                        <TextInput
                            keyboardType={"phone-pad"}
                            placeholder="Confirm the number"
                            style={[styles.inputStyle, {
                                marginTop: 10,
                                flexShrink: 1,  // Prevents wrapping
                                width: '100%',
                                height: 40,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            multiline={false}
                            onChangeText={(text) => handleInputChange('confirmPhoneNumber', text)}
                            value={inviteObject.confirmPhoneNumber}
                        />
                        {errorMessage ? (
                            <Text style={{color: 'red', marginTop: 5, textAlign: 'center'}}>{errorMessage}</Text>
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
                                <Text style={{fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Cancel</Text>
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
});
export default SearchUser;