import {Image, ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import Spinner from "@/components/Spinner";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useEffect, useState} from "react";
import {router} from "expo-router";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Divider} from "react-native-paper";
import {Player} from "@/models/Player";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {FontAwesome6} from "@expo/vector-icons";
import * as Linking from 'expo-linking';


enum MenuOption {
    Overview,
    Videos,
    Sports_Profiles
}

export const UserProfile = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [person, setPerson] = useState<UserResponse>();
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [selectOption, setSelectOption] = useState<MenuOption>(MenuOption.Overview);


    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    useEffect(() => {
        //TODO:: CALL Service get player by Id
    }, []);

    const _handleFollow = () => {
        //TODO:: Call service to follow the user given currentUser.id
    }

    const _option = (option: MenuOption) => {
        setSelectOption(option);
    }

    const _handleOpenUrl = (url: string | undefined) => {
        if (url === undefined) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    if (typeof url === "string") {
                        Linking.openURL(url);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to open URL:", err);
            });
    }

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                {loading && (
                    <Spinner visible={loading}/>
                )}
                <CustomNavigationHeader text={'Player'} goBackFunction={_handleGoBack} showBackArrow/>

                <View style={styles.mainContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}
                                contentContainerStyle={{alignItems: 'center'}}
                                style={{width: '100%', flex: 1}}>
                        <View style={styles.profileImageContainer}>
                            {person?.imageUrl ? <Image contentFit='contain' style={styles.imageContainer}
                                                       source={{uri: person.imageUrl}}/> : (
                                <View style={[styles.imageContainer, {
                                    justifyContent: 'center',
                                    backgroundColor: 'rgb(175,175,175)'
                                }]}>
                                    <Text style={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: 40,
                                        color: 'white'
                                    }}>{`${person?.firstName.charAt(0).toUpperCase()} ${person?.lastName.charAt(0).toUpperCase()}`}</Text>
                                </View>)}
                            <View style={styles.infoContainer}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    fontSize: 18
                                }}>{`${person?.firstName.charAt(0).toUpperCase()}${person?.firstName.slice(1).toLowerCase()} ${person?.lastName.charAt(0).toUpperCase()}${person?.lastName.slice(1).toLowerCase()}`}
                                </Text>
                                <Text style={{color: 'grey', fontSize: 16, marginTop: 5}}>
                                    {`${person?.city || ''}${person?.city && person?.stateRegion ? ', ' : ''}${person?.stateRegion || ''}${person?.stateRegion && person?.country ? ', ' : ''}${person?.country || ''}`}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.bioContainer}>
                            <Text style={{fontWeight: 'bold', fontSize: 16}}>Bio:</Text>
                            <Text style={{fontSize: 14, textAlign: 'center'}}>{person?.bio}</Text>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '90%',
                            marginTop: hp(2),
                        }}>
                            <TouchableOpacity onPress={() => _option(MenuOption.Overview)}>
                                <Text
                                    style={[styles.selectionText, selectOption == MenuOption.Overview && styles.selectedText]}>
                                    Overview
                                </Text>
                                {selectOption == MenuOption.Overview && <View style={styles.underline}/>}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => _option(MenuOption.Videos)}>
                                <Text
                                    style={[styles.selectionText, selectOption == MenuOption.Videos && styles.selectedText]}>
                                    Videos
                                </Text>
                                {selectOption == MenuOption.Videos && <View style={styles.underline}/>}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => _option(MenuOption.Sports_Profiles)}>
                                <Text
                                    style={[styles.selectionText, selectOption == MenuOption.Sports_Profiles && styles.selectedText]}>
                                    Sports Profile
                                </Text>
                                {selectOption == MenuOption.Sports_Profiles && <View style={styles.underline}/>}
                            </TouchableOpacity>
                        </View>
                        <Divider bold={true} style={{width: '90%', alignSelf: 'center', marginBottom: hp('2%')}}/>
                        <View style={{width: '90%', height: '23%'}}>
                            {selectOption === MenuOption.Overview && <>
                                <View style={{flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Sports Focus</Text>
                                        <Text style={styles.infoText}>Soccer</Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Age</Text>
                                        <Text style={styles.infoText}>22 Years</Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Positions</Text>
                                        <Text style={styles.infoText}>Midfilder</Text>
                                    </View>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    marginTop: 20,
                                    width: '100%'
                                }}>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Skills Focus</Text>
                                        <Text style={styles.infoText}>Advance</Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Followers</Text>
                                        <Text style={styles.infoText}>500</Text>
                                    </View>
                                </View>
                            </>}

                            {
                                selectOption == MenuOption.Videos && <>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        marginTop: 15,
                                        width: '100%'
                                    }}>
                                        <TouchableOpacity
                                            onPress={() => person?.instagramAccount && _handleOpenUrl(person?.instagramAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.instagramAccount}
                                        >
                                            <FontAwesome6
                                                name="instagram"
                                                size={40}
                                                color={person?.instagramAccount ? "#E4405F" : "#cccccc"}
                                                style={{opacity: person?.instagramAccount ? 1 : 0.5}}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => person?.tiktokAccount && _handleOpenUrl(person?.tiktokAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.tiktokAccount}
                                        >
                                            <FontAwesome6
                                                name="tiktok"
                                                size={40}
                                                color={person?.tiktokAccount ? "black" : "#cccccc"}
                                                style={{opacity: person?.tiktokAccount ? 1 : 0.5}}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => person?.facebookAccount && _handleOpenUrl(person?.facebookAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.facebookAccount}
                                        >
                                            <FontAwesome6
                                                name="facebook"
                                                size={40}
                                                color={person?.facebookAccount ? "blue" : "#cccccc"}
                                                style={{opacity: person?.facebookAccount ? 1 : 0.5}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        marginTop: 25,
                                        width: '100%'
                                    }}>
                                        <TouchableOpacity
                                            onPress={() => person?.youtubeAccount && _handleOpenUrl(person?.youtubeAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.youtubeAccount}>
                                            <FontAwesome6
                                                name="youtube"
                                                size={40}
                                                color={person?.youtubeAccount ? "red" : "#cccccc"}
                                                style={{opacity: person?.youtubeAccount ? 1 : 0.5}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            }
                            {
                                selectOption == MenuOption.Sports_Profiles && <>
                                    <View style={{justifyContent: 'center', width: '100%', height: '100%'}}>
                                        <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 16}}>Coming Soon
                                            ...</Text>
                                    </View>
                                </>
                            }
                            <TouchableOpacity
                                onPress={_handleFollow}
                                style={styles.followBtn}>
                                <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>Follow</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}


const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        alignItems: 'center',
    },
    profileImageContainer: {
        backgroundColor: 'white',
        height: 300,
        width: '90%',
        marginTop: hp(2),
        borderRadius: 15,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    imageContainer: {
        height: '70%',
        width: '100%',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        resizeMode: "contain",
        backgroundColor: 'blue'
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 15
    },
    bioContainer: {
        backgroundColor: 'white',
        height: 80,
        width: '90%',
        marginTop: hp(2),
        borderRadius: 15,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
        padding: 10
    },
    selectedText: {
        color: 'blue',
        fontWeight: 'bold',
    },
    selectionText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5
    },
    underline: {
        height: 2,
        backgroundColor: 'blue',
        marginTop: 5,
    },
    infoMiniCard: {
        borderWidth: 0.5,
        padding: 12,
        backgroundColor: 'white',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        borderColor: 'grey',
        width: widthPercentageToDP('28%'),
        maxWidth: 110,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    infoText: {
        fontWeight: 'bold',
        color: 'blue',
        fontSize: 14,
        marginTop: 5
    },
    followBtn: {
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: hp(2),
        width: 150,
        padding: 10,
        borderRadius: 15,
        alignItems: 'center'
    },
    iconCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 3,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
        borderColor: 'grey',
    }
});

export default UserProfile;