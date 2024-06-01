import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {router} from "expo-router";
import {FlashList} from "@shopify/flash-list";
import {heightPercentageToDP} from "react-native-responsive-screen";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import {memo, useEffect, useState} from "react";
import {Conversation} from "@/models/Conversation";
import {Avatar, Divider} from "react-native-paper";
import {Helpers} from "@/constants/Helpers";

const Notifications = () => {

    const [recentChats, setRecentChats] = useState<Conversation[]>([]);


    useEffect(() => {
        const fakers = Conversation.generateFakeConversations(10);
        setRecentChats(fakers);
    }, []);

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    const _onOpenNotification = (chat: Conversation): void => {
        console.log(chat);
    }

    const _renderNotifications = memo(({item}: { item: Conversation }) => {
        return (
            <TouchableOpacity
                onPress={() => _onOpenNotification(item)}
                style={styles.notification}>
                <View style={{flexDirection: 'row', height: 60}}>
                    <View style={{backgroundColor: 'white', flex: 0.2, alignItems: 'center'}}>
                        {item.participant1?.imageUrl ? (
                            <Avatar.Image size={50} source={{uri: item.participant1?.imageUrl}}/>
                        ) : (
                            <Avatar.Text
                                size={50}
                                // @ts-ignore
                                label={(item.participant1?.firstName?.charAt(0) + item.participant1?.lastName?.charAt(0)).toUpperCase()}/>
                        )}
                    </View>
                    <View style={{flex: 0.8}}>
                        <View style={{marginTop: 12, flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{fontWeight: 'bold', fontSize: 14}}>
                                You receive the swimming notification
                            </Text>
                        </View>
                        <Text
                            style={styles.notifyDate}>{Helpers.formatNotificationDate(item.lastMessage?.timestamp, true)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    });


    return (
        <ImageBackground
            style={{
                flex: 1,
                width: '100%',
            }}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={"Notification"} goBackFunction={_handleGoBack} showBackArrow/>
                <View style={styles.container}>
                    <View style={{height: '100%', width: '90%'}}>
                        <FlashList
                            data={recentChats}
                            renderItem={({item, index}) => <_renderNotifications item={item}/>}
                            keyExtractor={item => item.conversationId}
                            estimatedItemSize={10}
                            contentContainerStyle={{backgroundColor: 'white', padding: 10}}
                            ListFooterComponent={<View style={{height: heightPercentageToDP(20)}}>
                                <View style={styles.endFlashList}>
                                    <AntDesign name="checkcircle" size={20} color="#2757CB"/>
                                    <Text style={styles.endText}>End</Text>
                                </View>
                            </View>}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        alignItems: 'center'
    },
    notification: {
        marginBottom: 3,
        borderWidth: 1,
        paddingBottom: 3,
        paddingTop: 8,
        borderRadius: 10,
        borderColor: '#cbcdd0'
    },
    notifyDate: {
        color: 'grey',
        fontSize: 14,
        textAlign: 'auto',
        marginTop: 8
    },
    endFlashList: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    },
    endText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        color: '#2757CB'
    }
});

export default Notifications;