import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View
} from "react-native";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {router} from "expo-router";
import {useEffect, useRef, useState} from "react";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import Gender from "@/models/Gender";
import {Ionicons} from "@expo/vector-icons";
import SockJS from 'sockjs-client';
import {Client, IMessage} from '@stomp/stompjs';
import {useSelector} from "react-redux";
import {UserService} from "@/services/UserService";
import {useRoute} from "@react-navigation/core";
import {Message} from "@/models/Conversation";
import {AuthService} from "@/services/AuthService";


const url = 'https://sounds-kind-acres-ca.trycloudflare.com/ws';

const UserConversation = () => {

    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [receiver, setReceiver] = useState<UserResponse>();
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([
        /*{id: '1', text: 'Hello!', sender: 'user1'},
        {id: '2', text: 'Hi! How are you?', sender: 'user2'},
        {id: '3', text: 'I am good, thanks!', sender: 'user1'},*/
    ]);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);

    const route = useRoute();
    const paramData = route.params as any;

    useEffect(() => {
        setLoading(true);
        const receiverId = paramData?.data;
        const fetchUserData = async () => {
            const storedToken = await AuthService.getAccessToken();
            const userData = await UserService.getUserProfileById(receiverId);
            setLoading(false);
            if (userData) {
                setReceiver(userData);
                setToken(storedToken);
            } else {
                router.back();
            }
        }
        fetchUserData();
    }, []);

    useEffect(() => {
        console.info('INIT Socket');
        // @ts-ignore
        const socket = new SockJS(url);
        console.info('INITED Socket');
        console.info('INIT Stomp');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log('debug => ', str);
            },
            onConnect: () => {
                console.log('Connected');
                setConnected(true);
                client.subscribe('/ws-chat/queue/messages', (message: IMessage) => {
                    console.log('here messages => ');
                    console.log(message);
                    const msg: Message = JSON.parse(message.body);
                    //setMessages((prevMessages) => [...prevMessages, msg]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        console.info('INITED Stomp');
        client.activate();
        console.info('activated');
        setStompClient(client);

        return () => {
            client.deactivate();
        };

    }, [token]);

    const onMessageReceived = (message: any) => {
        const newMessage = JSON.parse(message.body);
        if (newMessage) {
            setMessages((old) => [...old, newMessage]);
        }
    }

    const onSendMessage = () => {
        console.log('verify message', connected);
        if (newMessage.trim() && receiver && stompClient && connected) {
            const message: Message = {
                senderId: currentUser.id,
                receiverId: receiver.id,
                message: newMessage,
                timestamp: new Date(),
            };
            console.log('good');
            stompClient.publish({
                destination: '/app/chat',
                body: JSON.stringify(message),
            });
            setNewMessage('');
            setMessages(old => [message, ...old]);
        }
    }


    const _renderMessage = ({item}: { item: Message }) => {
        const isCurrentUser = item.senderId === currentUser.id;
        return (
            <View
                style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                <Text style={[styles.messageText, {color: isCurrentUser ? 'white' : 'black'}]}>{item.message}</Text>
            </View>
        );
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