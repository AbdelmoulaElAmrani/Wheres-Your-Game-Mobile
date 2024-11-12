import {FlatList, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router} from "expo-router";
import React, {useCallback, useEffect, useState} from "react";
import {Avatar, Searchbar} from "react-native-paper";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import Spinner from "@/components/Spinner";
import {UserService} from "@/services/UserService";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {useRoute} from "@react-navigation/core";
import {Ionicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {FriendRequestService} from "@/services/FriendRequestService";


const SearchUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isParenting, setParenting] = useState<boolean>(false);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [searchType, setSearchType] = useState<UserType>();
    const route = useRoute();
    const params = route.params as any;


    useEffect(() => {
        const param = params?.searchType as keyof typeof UserType | undefined;

        if (param) {
            const userTypeValue = UserType[param];
            const isDefault = userTypeValue === UserType.DEFAULT;

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
        setLoading(true);
        const data = await UserService.SearchUsersByFullName(searchName, searchType);
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
    };

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
                {!item.friend ?
                    <Ionicons
                        onPress={() => isParenting ? _onSendingParentingRequest(item.id) : _onAddFriendOrRemove(item.id)}
                        name="person-add-outline" size={20} color="black"/>
                    :
                    <Ionicons name="person-sharp" size={20} color="#2757CB"/>
                }
            </TouchableOpacity>
        );
    }


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
                        style={{width: '100%', height: '100%', paddingVertical: 10, paddingHorizontal: 8}}>
                        <View style={{width: '100%', marginBottom: 30}}>
                            {people.length > 0 ? <FlatList
                                data={people}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={_renderUserItem}
                                style={styles.userList}
                                ListFooterComponent={<View style={{height: 50}}/>}
                            /> : <Text
                                style={{textAlign: 'center', fontWeight: 'bold', marginTop: heightPercentageToDP(30)}}>No
                                User</Text>}
                        </View>
                    </KeyboardAvoidingView>
                </View>
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
        borderTopLeftRadius: 20
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
});
export default SearchUser;