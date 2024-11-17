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
import { ChildrenService } from "@/services/ChildrenService";
import { Overlay } from "react-native-maps";
import OverlaySpinner from "@/components/OverlaySpinner";


const Notifications = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const data = await NotificationService.getNotifications();
                if (data) {
                    const sortedData = data.sort((a, b) => {
                        const dateA = new Date(a.creationDate);
                        const dateB = new Date(b.creationDate);
                        return dateB.getTime() - dateA.getTime();
                    });
                    setNotifications(sortedData);
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

    const _onOpenNotification = async (notification: NotificationResponse): Promise<void> => {
        try {
            await NotificationService.markNotificationAsRead(notification.id);
        } catch (ignored) {
        }
    };

    const _handleAcceptRequest = useCallback(async (requestId: string, type: NotificationType) => {
        try {
            let acceptResponse: boolean = false;
            if (type === NotificationType.PARENTING_REQUEST) {
                acceptResponse = await ChildrenService.acceptParentRequest(requestId);
            } else if (type === NotificationType.FRIEND_REQUEST) {
                acceptResponse = await FriendRequestService.acceptFriendRequest(requestId);
            }
            if (acceptResponse) {
                setLoading(true);
                const data = await NotificationService.getNotifications();
                if (data) {
                    const sortedData = data.sort((a, b) => {
                        const dateA = new Date(a.creationDate);
                        const dateB = new Date(b.creationDate);
                        return dateB.getTime() - dateA.getTime();
                    });
                    setNotifications(sortedData);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }, []);

    const _handleDeclineRequest = useCallback(async (requestId: string, type: NotificationType) => {
        try {
            let declineResponse: boolean = false;
            if (type === NotificationType.PARENTING_REQUEST) {
                declineResponse = await ChildrenService.rejectParentRequest(requestId);
            } else if (type === NotificationType.FRIEND_REQUEST) {
                declineResponse = await FriendRequestService.declineFriendRequest(requestId);
            }
            if (declineResponse) {
                setLoading(true);
                const data = await NotificationService.getNotifications();
                if (data) {
                    const sortedData = data.sort((a, b) => {
                        const dateA = new Date(a.creationDate);
                        const dateB = new Date(b.creationDate);
                        return dateB.getTime() - dateA.getTime();
                    });
                    setNotifications(sortedData);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }, []);

    const _renderNotifications = memo(({ item }: { item: NotificationResponse }) => {
        const isRequest = item.type === NotificationType.FRIEND_REQUEST || item.type === NotificationType.PARENTING_REQUEST;
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
                            <View style={{ width: isRequest ? '70%' : '100%' }}>
                                <Text
                                    numberOfLines={2}
                                    ellipsizeMode={"tail"}
                                    style={styles.notificationContentText}>{item.content}</Text>
                            </View>
                            {isRequest && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '30%' }}>
                                    <TouchableOpacity onPress={() => _handleAcceptRequest(item.requestId, item.type)}>
                                        <FontAwesome name="check" size={26} style={styles.acceptIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => _handleDeclineRequest(item.requestId, item.type)}>
                                        <FontAwesome name="times" size={26} style={styles.declineIcon} />
                                    </TouchableOpacity>
                                </View>)}
                        </View>
                        <Text
                            style={styles.notifyDate}>{Helpers.formatDateOnNotificationOrChat(item.creationDate, true)}</Text>
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
                        // <ActivityIndicator animating color={MD2Colors.blueA700} size={50} />
                        <OverlaySpinner visible={loading} />
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
        marginBottom: 10
    },
    notificationContentText: {
        fontWeight: '500',
        fontSize: 14,
    },
    acceptIcon: {
        marginRight: 10,
        color: '#2757CB',
    },
    declineIcon: {
        color: 'red',
        marginRight: 5,
    },
    notifyDate: {
        color: 'grey',
        fontSize: 14,
        textAlign: 'right',
        marginRight: 15
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
