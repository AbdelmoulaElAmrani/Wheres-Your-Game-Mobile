import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router} from "expo-router";
import {memo, useEffect, useState} from "react";
import {Conversation, Message} from "@/models/Conversation";
import {FlashList} from "@shopify/flash-list";
import {Avatar, Badge, Divider} from "react-native-paper";
import {Helpers} from "@/constants/Helpers";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {AntDesign, FontAwesome} from "@expo/vector-icons";

const Chats = () => {

    const [recentChats, setRecentChats] = useState<Conversation[]>([]);


    useEffect(() => {
        const fakers = Conversation.generateFakeConversations(10);
        setRecentChats(fakers);
    }, []);

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    const _onOpenConversation = (chat: Conversation): void => {
        console.log(chat);
    }

    const _renderConversation = memo(({item}: { item: Conversation }) => {
        return (
            <TouchableOpacity
                onPress={() => _onOpenConversation(item)}
                style={{marginBottom: 10}}>
                <View style={{flexDirection: 'row', height: 80}}>
                    <View style={{backgroundColor: 'white', flex: 0.2, alignItems: 'center'}}>
                        {item.participant1?.imageUrl ? (
                            <Avatar.Image size={50} source={{uri: item.participant1?.imageUrl}}/>
                        ) : (
                            <Avatar.Text
                                size={50}
                                label={(item.participant1?.firstName?.charAt(0) + item.participant1?.lastName?.charAt(0)).toUpperCase()}/>
                        )}
                    </View>
                    <View style={{flex: 0.8}}>
                        <View style={{marginTop: 12, flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{fontWeight: 'bold', fontSize: 14}}>
                                {item.participant1?.firstName + ' ' + item.participant1?.lastName}
                            </Text>
                            <View style={{flexDirection: "row", alignItems: 'center'}}>
                                <FontAwesome name="circle" style={{marginRight: 5}} size={10} color="#E15B2D"/>
                                <Text>{Helpers.formatNotificationDate(item.lastMessage?.timestamp)}</Text>
                            </View>
                        </View>
                        <Text style={{color: 'grey', fontSize: 14, textAlign: 'auto', marginTop: 8}}
                              numberOfLines={2}>Lorem
                            ipsum dolor sit amet, consectetur adipiscing elit.
                            Etiam consequat purus vitae purus condimentum fermentum. Vivamus augue nunc, aliquam
                            quis
                            nisi et,
                            faucibus pellentesque tortor. Suspendisse dictum euismod ligula, vitae molestie nisl
                            placerat quis.
                            Quisque elementum a arcu non pellentesque. Integer bibendum ut augue in congue. Praesent
                            ac
                            magna quis justo blandit porttitor.
                            Donec eu turpis sit amet ex fermentum vehicula vel nec lorem. Sed et eros nunc.</Text>
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
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>
                <CustomNavigationHeader text={"Message"} goBackFunction={_handleGoBack} showBackArrow/>
                <View style={{backgroundColor: 'white', height: '100%', width: '100%'}}>
                    <FlashList
                        data={recentChats}
                        renderItem={({item, index}) => <_renderConversation item={item}/>}
                        keyExtractor={item => item.conversationId}
                        estimatedItemSize={10}
                        contentContainerStyle={{backgroundColor: 'white', padding: 10}}
                        ListFooterComponent={<View style={{height: heightPercentageToDP(20)}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                <AntDesign name="checkcircle" size={20} color="#2757CB"/>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    marginLeft: 5,
                                    color: '#2757CB'
                                }}>End</Text>
                            </View>
                        </View>}
                    />
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
export default Chats;