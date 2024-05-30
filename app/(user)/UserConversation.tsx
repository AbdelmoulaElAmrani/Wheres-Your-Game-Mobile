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
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {useSelector} from "react-redux";
import {UserService} from "@/services/UserService";
import {useRoute} from "@react-navigation/core";

const UserConversation = () => {

    const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [receiver, setReceiver] = useState<UserResponse>({
        firstName: 'Bob',
        lastName: 'Mike',
        address: "",
        age: 0,
        bio: "",
        countryCode: "",
        dateOfBirth: new Date(),
        email: "",
        gender: Gender.MALE,
        id: "",
        imageUrl: "",
        isCertified: false,
        phoneNumber: "",
        positionCoached: "",
        role: "",
        yearsOfExperience: 0,
        zipCode: ""
    });
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState([
        {id: '1', text: 'Hello!', sender: 'user1'},
        {id: '2', text: 'Hi! How are you?', sender: 'user2'},
        {id: '3', text: 'I am good, thanks!', sender: 'user1'},
    ]);
    const [loading, setLoading] = useState<boolean>(false);
    const route = useRoute();
    const paramData = route.params as any; // Retrieve the parameter


    useEffect(() => {
        setLoading(true);
        const receiverId = paramData?.data;
        const fetchUserData = async () => {
            const userData = await UserService.getUserProfileById(receiverId);
            if (userData)
                setReceiver(userData);
            else
                router.back();
        }

        fetchUserData();
        /* const socket = new SockJS('http://your-backend-url/ws');
         const client: Stomp.Client = Stomp.over(socket);

         client.connect({}, () => {
             client.subscribe('/topic/messages', (message) => {
                 const newMessage = JSON.parse(message.body);
                 setMessages((prevMessages) => [...prevMessages, newMessage]);
             });
         });

         setStompClient(client);

         return () => {
             if (client) {
                 client.disconnect(() => {});
             }
         };*/
        setLoading(false);
    }, []);

    const handleSend = () => {
        if (stompClient && message.trim()) {
            /* const message = {
                 sender: { username },
                 receiver: { username: 'receiver-username' }, // Replace with actual receiver
                 content: newMessage,
                 timestamp: Date.now(),
             };*/

            //stompClient.send('/app/chat', {}, JSON.stringify(message));
            setMessage('');
        }
    };


    const _renderMessage = ({item}: { item: any }) => {
        const isCurrentUser = item.sender === 'user1';
        return (
            <View
                style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                <Text style={[styles.messageText, {color: isCurrentUser ? 'white' : 'black'}]}>{item?.text}</Text>
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
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView style={{flex: 1}}>
                <CustomNavigationHeader
                    text={`${receiver.firstName} ${receiver.lastName}`}
                    goBackFunction={_handleGoBack} showBackArrow/>

                <KeyboardAvoidingView
                    style={styles.chatContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
                    <View style={styles.messagesContainer}>
                        <FlatList
                            data={messages}
                            renderItem={_renderMessage}
                            keyExtractor={item => item.id}
                            inverted
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder='Type your message'
                            value={message}
                            onChangeText={setMessage}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
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