import {FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router, useRouter} from "expo-router";
import {memo, useEffect, useState} from "react";
import {Conversation} from "@/models/Conversation";
import {FlashList} from "@shopify/flash-list";
import {Avatar, Divider, Modal} from "react-native-paper";
import {Helpers} from "@/constants/Helpers";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {AntDesign} from "@expo/vector-icons";
import Spinner from "@/components/Spinner";
import {ChatService} from "@/services/ChatService";
import {UserService} from "@/services/UserService";
import moment from 'moment-timezone';


const MESSAGE_TIMER = 15 * 1000;
const Chats = () => {
    const [recentChats, setRecentChats] = useState<Conversation[]>([]);
    const _router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);


    useEffect(() => {
        setLoading(true);
        fetchConversations();
        setLoading(false);

        const intervalId = setInterval(() => {
            fetchConversations();
        }, MESSAGE_TIMER);

        return () => {
            clearInterval(intervalId)
        };
    }, []);

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    const fetchConversations = async () => {
        const data = await ChatService.getConversation();
        if (data)
            setRecentChats(data);
    }

    const _onOpenConversation = (chat: Conversation): void => {
        const receptionId = chat.user?.id;
        _router.push({
            pathname: '/UserConversation',
            params: {data: receptionId},
        });
    }


    const _showSearchUserModal = () => {
        setModalOpen(true);
    }
    const _hideSearchUserModal = () => {
        setModalOpen(false);
    }

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
            if (data)
                setPeople(data);
            else
                setPeople([]);
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

                    <View style={{width: '100%'}}>
                        {people.length > 0 ? <FlatList
                            data={people}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={_renderUserItem}
                            style={styles.userList}
                        /> : <Text
                            style={{textAlign: 'center', fontWeight: 'bold', marginTop: heightPercentageToDP(30)}}>No
                            User</Text>}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    });

    const _renderConversation = memo(({item}: { item: Conversation }) => {
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
                                <Text>{Helpers.formatNotificationDate(formattedDate, true)}</Text>
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

    return (
        <ImageBackground
            style={{
                flex: 1,
                width: '100%',
            }}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={"Message"} goBackFunction={_handleGoBack} showBackArrow/>
                <View style={styles.mainContainer}>
                    {loading && (
                        <Spinner visible={loading}/>
                    )}
                    <View style={styles.searchContainer}>
                        <TouchableOpacity
                            onPress={_showSearchUserModal}
                            style={{alignItems: 'flex-end', marginRight: 15, marginTop: '4%'}}>
                            <AntDesign name="pluscircle" size={30} color="#2757CB"/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.conversationContainer}>
                        {recentChats.length > 0 ?
                            <FlashList
                                data={recentChats}
                                renderItem={({item}) => <_renderConversation item={item}/>}
                                keyExtractor={item => item.user?.id + "- 1"}
                                estimatedItemSize={10}
                                contentContainerStyle={{backgroundColor: 'white', padding: 10}}
                                ListFooterComponent={<View style={{height: heightPercentageToDP(20)}}>
                                    <View style={styles.endContainer}>
                                        <AntDesign name="checkcircle" size={20} color="#2757CB"/>
                                        <Text style={styles.endText}>End</Text>
                                    </View>
                                </View>}
                            /> : <Text style={{alignSelf: 'center'}}>No Message</Text>
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
});
export default Chats;