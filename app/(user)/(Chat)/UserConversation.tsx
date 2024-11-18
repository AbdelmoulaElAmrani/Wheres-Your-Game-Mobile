import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View, Alert, ActivityIndicator
} from "react-native";
import {ImageBackground} from "expo-image";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {router, useFocusEffect, useLocalSearchParams} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Ionicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {UserService} from "@/services/UserService";
import {Message} from "@/models/Conversation";
import moment from 'moment-timezone';
import {ChatService} from "@/services/ChatService";
import {CHAT_REFRESH_TIMER} from "@/appConfig";
import CustomChatNavigationHeader from "@/components/CustomChatNavigationHeader";
import {BlockService} from "@/services/BlockService";

const MAX_REFRESH_TIME: number = CHAT_REFRESH_TIMER * 1000;

const UserConversation = () => {

    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [receiver, setReceiver] = useState<UserResponse | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [enabledSend, setEnabledSend] = useState<boolean>(true);
    const [childId, setChildId] = useState<string | undefined>(undefined);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const paramData = useLocalSearchParams<any>();
    const insets = useSafeAreaInsets();


    useFocusEffect(useCallback(() => {
        setLoading(true);
        const receiverId = paramData?.receptionId;
        const child = paramData?.childId;
        if (child)
            setChildId(child);
        const fetchUserDataAndMessages = async () => {
            const userData = await UserService.getUserProfileById(receiverId, childId);
            setLoading(false);
            if (userData) {
                setReceiver(userData);
            } else {
                router.back();
            }
        }
        fetchUserDataAndMessages();

        const lastMessageInterval = setInterval(_getNewMessages, MAX_REFRESH_TIME);
        return () => {
            clearInterval(lastMessageInterval);
        }
    }, []));

    const _getNewMessages = async () => {
        try {
            if (!receiver || !currentUser) return;
            let from: Date | null = null;

            if (messages.length > 0) {
                const maxTimestamp = Math.max(...messages.map(m => new Date(m.timestamp).getTime()));
                from = new Date(maxTimestamp);
            }

            const fromISOString = from?.toISOString();
            const msgs = await ChatService.getLastMessages(receiver.id, fromISOString, childId);

            if (msgs && msgs.length > 0) {
                setMessages(oldMessages => {
                    const existingMessageIds = new Set(oldMessages.map(m => m.id));
                    const newMessages = msgs.filter(m => !existingMessageIds.has(m.id));
                    return [...newMessages, ...oldMessages];
                });
            }
        } catch (e) {
            console.log(e);
        }
    };

    const onSendMessage = async () => {
        const timestamp = moment.tz(moment.tz.guess()).format();
        setEnabledSend(false);
        try {
            if (newMessage.trim() && receiver) {
                const message: Message = {
                    senderId: childId ? childId : currentUser.id,
                    receiverId: receiver.id,
                    message: newMessage,
                    timestamp: timestamp,
                };
                const response = await ChatService.sendMessage(message, childId);
                setNewMessage('');
                setMessages(old => [response, ...old]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setEnabledSend(true);
        }
    }

    const _renderMessage = ({item}: { item: Message }) => {
        const isCurrentUser = item.senderId === (childId ? childId : currentUser.id);

        return (
            <View
                style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                <Text style={[styles.messageText, {color: isCurrentUser ? 'white' : 'black'}]}>{item.message}</Text>
            </View>
        );
    };

    const loadMessages = async () => {
        if (loading || !hasMore || receiver == null) return;
        setLoading(true);
        try {
            const data = await ChatService.getMessages(receiver.id, page, childId);
            if (data?.content?.length) {
                setMessages((prevMessages) => [...prevMessages, ...data.content]);
                if (data.empty || data.last || data.content.length < 100) {
                    setHasMore(false);
                } else {
                    setPage((prevPage) => prevPage + 1);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadMessages();
        }
    };

    const _handleBlockUser = async () => {
        if (!receiver) {
            console.error('No receiver found to block.');
            return;
        }
        Alert.alert(
            'Confirm Block',
            `Are you sure you want to block ${receiver.firstName} ${receiver.lastName}?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('User block action canceled.'),
                    style: 'cancel',
                },
                {
                    text: 'Block',
                    onPress: async () => {
                        const res = await BlockService.blockUser(receiver.id, childId);
                        if (res) {
                            Alert.alert(
                                'User Blocked',
                                `${receiver.firstName} ${receiver.lastName} has been blocked.`
                            );
                            router.back();
                        } else {
                            Alert.alert(
                                'Error',
                                `Failed to block ${receiver.firstName} ${receiver.lastName}. Please try again.`
                            );
                        }
                    },
                },
            ]
        );
    }


    return (
        <ImageBackground
            style={StyleSheet.absoluteFill}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <KeyboardAvoidingView
                keyboardVerticalOffset={Platform.OS == 'ios' ? -insets.bottom : 0}
                style={{flex: 1}}
                behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <SafeAreaView style={{flex: 1}}>
                    <CustomChatNavigationHeader
                        title={`${receiver?.firstName} ${receiver?.lastName}`}
                        isBlocked={receiver?.blockedByPrincipal || receiver?.blockedByTheUser}
                        blockFunction={_handleBlockUser}
                        role={receiver?.role}/>
                    <View style={[styles.chatContainer]}>
                        <FlatList
                            data={messages}
                            renderItem={_renderMessage}
                            keyExtractor={item => item.id + item.timestamp.toString()}
                            inverted
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5} // Adjust the threshold as needed
                            ListFooterComponent={loading ?
                                <ActivityIndicator style={{margin: 10}} size="small"/> : null}
                        />
                    </View>
                    <View
                        style={[styles.inputContainer, (receiver?.blockedByPrincipal || receiver?.blockedByTheUser) && {
                            backgroundColor: 'grey',
                            justifyContent: 'center'
                        }]}>
                        {(!receiver?.blockedByPrincipal && !receiver?.blockedByTheUser) ?
                            (<>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder='Type your message'
                                    value={newMessage}
                                    onChangeText={setNewMessage}
                                />
                                <TouchableOpacity style={styles.sendButton} disabled={!enabledSend}
                                                  onPress={onSendMessage}>
                                    <Ionicons name="send" size={24} color="white"/>
                                </TouchableOpacity>
                            </>) : (
                                <Text style={{fontSize: 16, textAlign: 'center', padding: 10, color: 'white'}}>You
                                    cannot chat with the
                                    user</Text>)
                        }
                    </View>
                </SafeAreaView>
                <View style={{
                    backgroundColor: 'white',
                    position: "absolute",
                    bottom: 0,
                    height: insets.bottom,
                    width: '100%'
                }}/>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    chatContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: 'white'
    },
    messageContainer: {
        borderRadius: 20,
        padding: 10,
        marginVertical: 5,
        maxWidth: '70%',
        alignSelf: 'flex-start',
    },
    currentUserMessage: {
        backgroundColor: '#2757CB',
        alignSelf: 'flex-end',
    },
    otherUserMessage: {
        backgroundColor: '#E8E8E8',
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textInput: {
        flex: 1,
        height: 40,
        borderColor: '#E8E8E8',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    sendButton: {
        backgroundColor: 'rgba(0,65,232,0.98)',
        borderRadius: 24,
        padding: 10,
        marginLeft: 10,
    },
});

export default UserConversation;