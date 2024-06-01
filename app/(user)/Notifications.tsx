import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ImageBackground } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Avatar, Divider, MD2Colors } from "react-native-paper";
import { Helpers } from "@/constants/Helpers";
import { NotificationResponse } from "@/models/responseObjects/NotificationResponse";
import { NotificationService } from "@/services/NotificationService";
import NotificationType from "@/models/NotificationType";
import { FriendRequestService } from "@/services/FriendRequestService";

const Notifications = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await NotificationService.getNotifications();
                if (res) {
                    setNotifications(res);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const _handleGoBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        }
    }, []);

    const _onOpenNotification = useCallback((chat: NotificationResponse): void => {
        console.log(chat);
    }, []);

    const _handleAcceptRequest = useCallback(async (requestId: string) => {
        try {
            const acceptResponse = await FriendRequestService.acceptFriendRequest(requestId);
            if (acceptResponse) {
                setLoading(true);
                const notifications = await NotificationService.getNotifications();
                if (notifications) {
                    setNotifications(notifications);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, []);

    const _handleDeclineRequest = useCallback(async (requestId: string) => {
        try {
            const declineResponse = await FriendRequestService.declineFriendRequest(requestId);
            if (declineResponse) {
                setLoading(true);
                const notifications = await NotificationService.getNotifications();
                if (notifications) {
                    setNotifications(notifications);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, []);

    const _renderNotifications = memo(({ item }: { item: NotificationResponse }) => {
        return (
            <TouchableOpacity onPress={() => _onOpenNotification(item)} style={styles.notification}>
                <View style={styles.notificationContent}>
                    <View style={styles.avatarContainer}>
                        {item.imageUrl ? (
                            <Avatar.Image size={45} source={{ uri: item.imageUrl }} />
                        ) : (
                            <Avatar.Text
                                size={45}
                                label={(item.senderFullName?.charAt(0) + item.senderFullName?.split(' ')[1]?.charAt(0)).toUpperCase()}
                            />
                        )}
                    </View>
                    <View style={styles.notificationTextContainer}>
                        <View style={styles.notificationHeader}>
                            <Text style={styles.notificationContentText}>{item.content}</Text>
                            {item.type === NotificationType.FRIEND_REQUEST && (
                                <View style={styles.friendRequestActions}>
                                    <TouchableOpacity onPress={() => _handleAcceptRequest(item.requestId)}>
                                        <FontAwesome name="check" size={24} style={styles.acceptIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => _handleDeclineRequest(item.requestId)}>
                                        <FontAwesome name="times" size={24} style={styles.declineIcon} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Text style={styles.notifyDate}>{Helpers.formatNotificationDate(item.creationDate, true)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    });

    return (
        <ImageBackground style={styles.backgroundImage} source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text="Notification" goBackFunction={_handleGoBack} showBackArrow />
                <View style={styles.container}>
                    {loading ? (
                        <ActivityIndicator animating color={MD2Colors.blueA700} size={50} />
                    ) : (
                        <View style={styles.flashListContainer}>
                            <FlashList
                                data={notifications}
                                renderItem={({ item }) => <_renderNotifications item={item} />}
                                keyExtractor={item => item.id}
                                estimatedItemSize={10}
                                contentContainerStyle={styles.flashListContent}
                                ListFooterComponent={
                                    <View style={styles.endFlashListContainer}>
                                        <View style={styles.endFlashList}>
                                            <AntDesign name="checkcircle" size={20} color="#2757CB" />
                                            <Text style={styles.endText}>End</Text>
                                        </View>
                                    </View>
                                }
                            />
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        alignItems: 'center',
    },
    notification: {
        marginBottom: 3,
        borderWidth: 1,
        paddingBottom: 3,
        paddingTop: 8,
        borderRadius: 10,
        borderColor: '#cbcdd0',
    },
    notificationContent: {
        flexDirection: 'row',
        height: 'auto',
        padding: 5,
    },
    avatarContainer: {
        backgroundColor: 'white',
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationTextContainer: {
        flex: 0.8,
        paddingLeft: 5,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationContentText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    friendRequestActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    acceptIcon: {
        marginRight: 10,
        color: 'grey',
    },
    declineIcon: {
        color: 'grey',
        marginRight: 5,
    },
    notifyDate: {
        color: 'grey',
        fontSize: 14,
    },
    endFlashList: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    endText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        color: '#2757CB',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    flashListContainer: {
        height: '100%',
        width: '95%',
    },
    flashListContent: {
        backgroundColor: 'white',
        padding: 10,
    },
    endFlashListContainer: {
        height: heightPercentageToDP(20),
    },
});

export default Notifications;
