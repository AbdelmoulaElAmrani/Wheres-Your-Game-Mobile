import {
    FlatList,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router, useFocusEffect, useRouter} from "expo-router";
import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {Conversation} from "@/models/Conversation";
import {FlashList} from "@shopify/flash-list";
import {Avatar, Divider, Modal} from "react-native-paper";
import {Helpers} from "@/constants/Helpers";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import Spinner from "@/components/Spinner";
import {ChatService} from "@/services/ChatService";
import {UserService} from "@/services/UserService";
import moment from 'moment-timezone';
import {CONVERSATION_REFRESH_TIMER} from "@/appConfig";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import RNPickerSelect from "react-native-picker-select";
import OverlaySpinner from "@/components/OverlaySpinner";


const MESSAGE_TIMER = CONVERSATION_REFRESH_TIMER * 1000;
const Chats = () => {
    const [recentChats, setRecentChats] = useState<Conversation[]>([]);
    const _router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;

    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [tempSelectedProfileId, setTempSelectedProfileId] = useState<string>('');

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }


    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                await fetchConversations();
            } catch (ignored) {

            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (modalOpen)
            startInterval();
        else
            startInterval();

        return () => {
            stopInterval();
        };
    }, [modalOpen]);

    const startInterval = () => {
        if (!intervalIdRef.current) {
            intervalIdRef.current = setInterval(fetchConversations, MESSAGE_TIMER);
        }
    };

    const stopInterval = () => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
    };

    const fetchConversations = async () => {
        if (!modalOpen) {
            const data = await ChatService.getConversation(selectedProfileId);
            if (data) {
                try {
                    const sortedData = data.sort((a, b) => {
                        const dateA = new Date(a.lastActiveDate);
                        const dateB = new Date(b.lastActiveDate);
                        return dateB.getTime() - dateA.getTime();
                    });
                    setRecentChats(sortedData);
                } catch (e) {
                    setRecentChats(data);
                }
            }
        }
    }

    const _onOpenConversation = (chat: Conversation): void => {
        const receptionId = chat.user?.id;
        _router.push({
            pathname: '/UserConversation',
            params: {receptionId: receptionId, childId: selectedProfileId},
        });
    }

    const _showSearchUserModal = () => setModalOpen(true);

    const _hideSearchUserModal = () => setModalOpen(false);

    const startChatWithUser = (item: UserSearchResponse) => {
        _hideSearchUserModal();
        const receptionId = item.id;
        _router.push({
            pathname: '/UserConversation',
            params: {data: receptionId},
        });
    }

    const _userSearchModal = memo(() => {
        const [searchName, setSearchName] = useState<string>('');
        const [people, setPeople] = useState<UserSearchResponse[]>([]);

        const _onSearchSubmit = async () => {
            if (searchName.trim() === '') return;
            const data = await UserService.SearchUsersByFullName(searchName);
            setPeople(data || []);
        }
        const _renderUserItem = ({item}: { item: UserSearchResponse }) => (
            <TouchableOpacity style={styles.userItem} onPress={() => startChatWithUser(item)}>

                {item.imageUrl ? (
                    <Avatar.Image size={35} source={{uri: item.imageUrl}}/>
                ) : (
                    <Avatar.Text
                        size={35}
                        label={(item?.firstName?.charAt(0) + item?.lastName?.charAt(0)).toUpperCase()}
                    />
                )}
                <Text style={styles.userName}>{`${item.firstName} ${item.lastName}`}</Text>
            </TouchableOpacity>
        );
        return (
            <Modal visible={modalOpen}
                   onDismiss={_hideSearchUserModal}
                   contentContainerStyle={styles.modal}>
                <KeyboardAvoidingView
                    style={{width: '100%', height: '100%', paddingVertical: 10, paddingHorizontal: 8}}>
                    <View style={{
                        width: '95%',
                        marginTop: heightPercentageToDP(1.5),
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        alignSelf: 'center'
                    }}>
                        <TextInput
                            placeholder='Search name'
                            placeholderTextColor='#bbb'
                            onChangeText={(value) => setSearchName(value)}
                            value={searchName}
                            returnKeyType='search'
                            autoFocus={true}
                            onSubmitEditing={_onSearchSubmit}
                            clearButtonMode="while-editing"
                            style={styles.searchText}
                        />
                        <TouchableOpacity
                            onPress={_hideSearchUserModal}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{width: '100%', height: '90%', marginBottom: 30}}>
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
            </Modal>
        );
    });

    const _renderConversation = memo(({item}: { item: Conversation | undefined }) => {
        if (!item) return <></>
        const userTimeZone = moment.tz.guess(); // Get the user's time zone
        const formattedDate = moment(item.lastActiveDate).tz(userTimeZone).toDate();
        return (
            <TouchableOpacity
                onPress={() => _onOpenConversation(item)}
                style={{marginBottom: 10}}>
                <View style={{flexDirection: 'row', height: 80}}>
                    <View style={{backgroundColor: 'white', flex: 0.2, alignItems: 'center'}}>
                        {item.user?.imageUrl ? (
                            <Avatar.Image size={50} source={{uri: item.user?.imageUrl}}/>
                        ) : (
                            <Avatar.Text
                                size={50}
                                // @ts-ignore
                                label={(item.user?.firstName?.charAt(0) + item.user?.lastName?.charAt(0)).toUpperCase()}/>
                        )}
                    </View>
                    <View style={{flex: 0.8}}>
                        <View style={{marginTop: 12, flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{fontWeight: 'bold', fontSize: 14}}>
                                {item.user?.firstName + ' ' + item.user?.lastName}
                            </Text>
                            <View style={{flexDirection: "row", alignItems: 'center'}}>
                                <Text>{Helpers.formatDateOnNotificationOrChat(formattedDate)}</Text>
                            </View>
                        </View>
                        <Text style={{color: 'grey', fontSize: 14, textAlign: 'auto', marginTop: 8}}
                              numberOfLines={2}>
                            {item.lastMessage?.message}
                        </Text>
                    </View>
                </View>
                <Divider/>
            </TouchableOpacity>
        );
    });

    const isFirstRender = useRef<boolean>(true);

    useFocusEffect(useCallback(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        fetchConversations();
        stopInterval();
        startInterval();
    }, [selectedProfileId]));

    return (
        <ImageBackground
            style={{
                flex: 1,
                width: '100%',
            }}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            {loading && (
                <OverlaySpinner visible={loading}/>
            )}
            <SafeAreaView>
                <CustomNavigationHeader text={"Message"} goBackFunction={_handleGoBack} showBackArrow/>
                <View style={styles.mainContainer}>
                    <View style={styles.searchContainer}>
                        {(selectedProfileId == '' || selectedProfileId == currentUser.id) &&
                            <TouchableOpacity
                                onPress={_showSearchUserModal}
                                style={{alignItems: 'flex-end', marginRight: 15, marginTop: '4%'}}>
                                <AntDesign name="pluscircle" size={30} color="#2757CB"/>
                            </TouchableOpacity>}
                    </View>
                    {currentUser.role == UserType[UserType.PARENT] && (<View style={styles.parentFilter}>
                        <View style={{width: '80%'}}>
                            <RNPickerSelect
                                placeholder={{
                                    label: 'Me',
                                    value: '',
                                    color: 'black',
                                }}
                                items={currentUser?.children?.map(child => ({
                                    label: child.fullName,
                                    value: child.id,
                                    id: child.id,
                                    color: 'black',
                                })) || []}
                                onValueChange={(value, index) => {
                                    if (value === '') {
                                        setTempSelectedProfileId('');
                                    } else {
                                        setTempSelectedProfileId(value);
                                    }
                                }}
                                onDonePress={() => {
                                    setSelectedProfileId(tempSelectedProfileId);
                                }}
                                onClose={() => {
                                    setTempSelectedProfileId(selectedProfileId);
                                }}
                                style={{
                                    ...pickerSelectStyles,
                                    inputAndroid: {
                                        ...pickerSelectStyles.inputAndroid,
                                        backgroundColor: '#f0f0f0',
                                    }
                                }}
                                Icon={() => (
                                    <Ionicons
                                        name="chevron-down"
                                        size={24}
                                        color="#333"
                                        style={{position: 'absolute', top: '50%', marginTop: 12, right: 10}}
                                    />
                                )}
                            />
                        </View>
                    </View>)}
                    <View style={styles.conversationContainer}>
                        {recentChats.length > 0 ?
                            <FlashList
                                data={recentChats}
                                renderItem={({item}) => <_renderConversation item={item}/>}
                                keyExtractor={(item, index) => item?.user?.id + "-" + index}
                                estimatedItemSize={10}
                                contentContainerStyle={{backgroundColor: 'white', padding: 10}}
                                ListFooterComponent={<View style={{height: heightPercentageToDP(20)}}>
                                    <View style={styles.endContainer}>
                                        <AntDesign name="checkcircle" size={20} color="#2757CB"/>
                                        <Text style={styles.endText}>End</Text>
                                    </View>
                                </View>}
                            /> :
                            <Text style={{alignSelf: 'center', marginTop: heightPercentageToDP(30)}}>No Message</Text>
                        }
                    </View>
                </View>
                {modalOpen && <_userSearchModal/>}
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    endText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        color: '#2757CB'
    },
    mainContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%'
    },
    endContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    conversationContainer: {
        height: '90%',
        width: '100%'
    },
    searchContainer: {
        height: '6%',
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
    searchText: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        color: '#000',
        flex: 1,
        marginRight: 10,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'blue',
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
        marginTop: heightPercentageToDP(1)
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: widthPercentageToDP(2)
    },
    parentFilter: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        color: '#333',
        paddingRight: 30, // To ensure the text is not hidden by the icon
        backgroundColor: '#fff',
    },
    inputIOS: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        color: '#333',
        paddingRight: 30, // To ensure the text is not hidden by the icon
        backgroundColor: '#fff',
    },
    placeholder: {
        color: '#9EA0A4',
        fontSize: 16,
    },
});
export default Chats;