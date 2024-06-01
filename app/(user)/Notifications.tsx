import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ImageBackground } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { memo, useEffect, useState } from "react";
import { Conversation } from "@/models/Conversation";
import { Avatar, Divider } from "react-native-paper";
import { Helpers } from "@/constants/Helpers";
import { NotificationResponse } from "@/models/responseObjects/NotificationResponse";
import { NotificationService } from "@/services/NotificationService";
import NotificationType from "@/models/NotificationType";
import { FriendRequestService } from "@/services/FriendRequestService";

const Notifications = () => {

    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        NotificationService.getNotifications()
            .then((res) => {
                if (res) {
                    setNotifications(res);
                }
            });
    }, []);
    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    const _onOpenNotification = (chat: NotificationResponse): void => {
        console.log(chat);
    }

    const _handleAcceptRequest = (requestId: string) => {

        FriendRequestService.acceptFriendRequest(requestId).
            then((res) => {
                if (res) {
                    NotificationService.getNotifications()
                        .then((res) => {
                            if (res) {
                                setNotifications(res);
                            }
                        });
                }
            });


        
    }
    const _handleDeclineRequest = (requestId: string) => {
        FriendRequestService.declineFriendRequest(requestId)
            .then((res) => {
                if (res) {
                    NotificationService.getNotifications()
                        .then((res) => {
                            if (res) {
                                setNotifications(res);
                            }
                        });
                }
            });
    }

    const _renderNotifications = memo(({ item }: { item: NotificationResponse }) => {
        return (
            <TouchableOpacity
                onPress={() => _onOpenNotification(item)}
                style={styles.notification}>
                <View style={{ flexDirection: 'row', height: 60 }}>
                    <View style={{ backgroundColor: 'white', flex: 0.2, alignItems: 'center' }}>
                        {item.imageUrl ? (
                            <Avatar.Image size={50} source={{ uri: item?.imageUrl }} />
                        ) : (
                            <Avatar.Text
                                size={50}
                                label={(item.senderFullName?.charAt(0) + item.senderFullName?.split(' ')[1]?.charAt(0)).toUpperCase()}
                            />
                        )}
                    </View>
                    <View style={{ flex: 0.8 }}>
                        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
                                {item.content}


                            </Text>

                            {item.type === NotificationType.FRIEND_REQUEST && (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => _handleAcceptRequest(item.requestId)} >
                                        <FontAwesome name="check" size={24} color="black" style={styles.acceptIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => _handleDeclineRequest(item.requestId)} >
                                        <FontAwesome name="times" size={24} color="black" style={styles.declineIcon} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Text
                            style={styles.notifyDate}>{Helpers.formatNotificationDate(item.creationDate, true)}</Text>
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
                <CustomNavigationHeader text={"Notification"} goBackFunction={_handleGoBack} showBackArrow />
                <View style={styles.container}>
                    <View style={{ height: '100%', width: '95%' }}>
                        <FlashList
                            data={notifications}
                            renderItem={({ item, index }) => <_renderNotifications item={item} />}
                            keyExtractor={item => item.id}
                            estimatedItemSize={10}
                            contentContainerStyle={{ backgroundColor: 'white', padding: 10 }}
                            ListFooterComponent={<View style={{ height: heightPercentageToDP(20) }}>
                                <View style={styles.endFlashList}>
                                    <AntDesign name="checkcircle" size={20} color="#2757CB" />
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
        borderColor: '#cbcdd0',
    },
    notifyDate: {
        color: 'grey',
        fontSize: 14,
        textAlign: 'auto',
        marginTop: 2
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
    },
    acceptIcon: {
        marginRight: 20,
        color: 'green'
    },
    declineIcon: {
        color: 'red',
        marginRight: 10
    }
});

export default Notifications;