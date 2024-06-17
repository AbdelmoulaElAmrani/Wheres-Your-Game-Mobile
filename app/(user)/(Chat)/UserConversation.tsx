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
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {router} from "expo-router";
import {useEffect, useRef, useState} from "react";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Ionicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {UserService} from "@/services/UserService";
import {useRoute} from "@react-navigation/core";
import {Message} from "@/models/Conversation";
import moment from 'moment-timezone';
import {ChatService} from "@/services/ChatService";
import {Helpers} from "@/constants/Helpers";

const MAX_REFRESH_TIME: number = CHAT_REFRESH_TIMER * 1000;

const UserConversation = () => {

    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [receiver, setReceiver] = useState<UserResponse | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const route = useRoute();
    const paramData = route.params as any;

    useEffect(() => {
        setLoading(true);
        const receiverId = paramData?.data;
        const fetchUserDataAndMessages = async () => {
            const userData = await UserService.getUserProfileById(receiverId);
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
    }, []);


    const _getNewMessages = async () => {
        try {
            if (!receiver || !currentUser) return;
            let from = null;
            if (messages.length > 0) {
                from = new Date(Math.max(...messages.map(m => new m.timestamp)));
            }
            console.log('MAX => ', from);
            const msgs = await ChatService.getLastMessages(currentUser.id, receiver.id, from);
            console.log('new messages => ', msgs);
            if (msgs && msgs.length > 0)
                setMessages(old => [...msgs, ...old])
        } catch (e) {
            console.log(e);
        }
    }
    const onSendMessage = async () => {
        const timestamp = moment.tz(moment.tz.guess()).format();
        try {

            if (newMessage.trim() && receiver) {
                const message: Message = {
                    senderId: currentUser.id,
                    receiverId: receiver.id,
                    message: newMessage,
                    timestamp: timestamp,
                };
                const response = await ChatService.sendMessage(message);
                setNewMessage('');
                setMessages(old => [message, ...old]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    }

    const _renderMessage = ({item}: { item: Message }) => {
        const isCurrentUser = item.senderId === currentUser.id;
        const userTimeZone = moment.tz.guess();
        const formattedDate = moment(item.timestamp).tz(userTimeZone).toDate()

        return (
            /* <View
                 style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                 <Text style={[styles.messageText, {color: isCurrentUser ? 'white' : 'black'}]}>{item.message}</Text>
             </View>*/
            <View
                style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                <Text style={[styles.messageText, {color: isCurrentUser ? 'white' : 'black'}]}>{item.message}</Text>
                <Text style={styles.timestampText}>{Helpers.formatNotificationDate(formattedDate, true)}</Text>
            </View>
        );
    };


    const loadMessages = async () => {
        if (loading || !hasMore || receiver == null) return;
        setLoading(true);
        try {
            const data = await ChatService.getMessages(currentUser.id, receiver.id, page);
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
        console.log('loading more');
        if (!loading && hasMore) {
            loadMessages();
        }
    };
    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    return (
        <ImageBackground
            style={StyleSheet.absoluteFill}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView style={{flex: 1}}>
                <CustomNavigationHeader
                    text={`${receiver?.firstName} ${receiver?.lastName}`}
                    goBackFunction={_handleGoBack} showBackArrow/>

                <KeyboardAvoidingView
                    style={styles.chatContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
                    <View style={styles.messagesContainer}>
                        <FlatList
                            data={messages}
                            renderItem={_renderMessage}
                            keyExtractor={item => item.id + item.timestamp.toString()}
                            inverted
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5} // Adjust the threshold as needed
                            ListFooterComponent={loading ? <ActivityIndicator size="large"/> : null}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder='Type your message'
                            value={newMessage}
                            onChangeText={setNewMessage}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={onSendMessage}>
                            <Ionicons name="send" size={24} color="white"/>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>);
}

const styles = StyleSheet.create({
    chatContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
    },
    messagesContainer: {
        height: '80%',
        padding: 10,
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
    timestampText: {
        fontSize: 12,
        color: 'grey',
        marginTop: 5,
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