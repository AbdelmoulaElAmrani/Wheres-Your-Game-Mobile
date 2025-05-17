import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import React, {useCallback, useState} from "react";
import {router, useFocusEffect, useRouter} from "expo-router";
import {getUserProfile} from "@/redux/UserSlice";
import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform} from "react-native";
import {Avatar, Divider, Modal, TextInput} from "react-native-paper";
import {FontAwesome6} from "@expo/vector-icons";
import * as Linking from "expo-linking";
import {Helpers} from "@/constants/Helpers";
import OverlaySpinner from "@/components/OverlaySpinner";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import CustomButton from "@/components/CustomButton";
import {UserService} from "@/services/UserService";
import UserType from "@/models/UserType";

enum MenuOption {
    Overview,
    Videos,
    Sports_Profiles,
    Childrens
}

export const ProfileV2 = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse | undefined;
    const loading = useSelector((state: any) => state.user.loading) as boolean;
    const [selectOption, setSelectOption] = useState<MenuOption>(MenuOption.Overview);
    const [isSocialMediaCardVisible, setSocialMediaCardVisible] = useState(false);
    const [socialMediaLink, setSocialMediaLink] = useState({
        facebook: '',
        instagram: '',
        tiktok: '',
        youtube: ''
    });
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const _router = useRouter();


    useFocusEffect(useCallback(() => {
        (async () => {
            await dispatch(getUserProfile() as any);
        })();
        setSocialMediaLink({
            facebook: currentUser?.socialMediaLinks?.facebookAccount || '',
            instagram: currentUser?.socialMediaLinks?.instagramAccount || '',
            tiktok: currentUser?.socialMediaLinks?.tiktokAccount || '',
            youtube: currentUser?.socialMediaLinks?.youtubeAccount || '',
        });
    }, []))


    /* useEffect(() => {
         /!*if (isFocused && currentUser?.id && !hasRun.current) {
             dispatch(getUserSports(currentUser.id) as any);
             hasRun.current = true;
         }
         if (!isFocused) {
             hasRun.current = false;
         }*!/
     }, [isFocused, currentUser]);*/

    const _hideSocialMediaCard = () => setSocialMediaCardVisible(false);

    const _showSocialMediaCard = () => setSocialMediaCardVisible(true);


    const _handleSocialMediaLink = async () => {
        const isValidLink =
            (socialMediaLink.facebook && (socialMediaLink.facebook.includes('facebook.com') || socialMediaLink.facebook.includes('fb.com'))) ||
            (socialMediaLink.instagram && socialMediaLink.instagram.includes('instagram.com')) ||
            (socialMediaLink.tiktok && (socialMediaLink.tiktok.includes('tiktok.com') || socialMediaLink.tiktok.includes('vm.tiktok.com'))) ||
            (socialMediaLink.youtube && (socialMediaLink.youtube.includes('youtube.com') || socialMediaLink.youtube.includes('youtu.be')));

        if (!isValidLink) {
            Alert.alert(
                'Invalid Link',
                'Please enter a valid link from Facebook, Instagram, YouTube, or TikTok.',
                [{text: 'OK'}]
            );
            return;
        }

        const updatedLink = await UserService.updateUserSocialLinks({
            facebookAccount: socialMediaLink.facebook,
            instagramAccount: socialMediaLink.instagram,
            tiktokAccount: socialMediaLink.tiktok,
            youtubeAccount: socialMediaLink.youtube,
        });
        setSocialMediaLink({
            facebook: updatedLink?.facebookAccount || '',
            instagram: updatedLink?.instagramAccount || '',
            tiktok: updatedLink?.tiktokAccount || '',
            youtube: updatedLink?.youtubeAccount || '',
        });
        setSocialMediaCardVisible(false);
        await dispatch(getUserProfile() as any);
    };

    const _handleSettings = () => {
        if (selectOption == MenuOption.Videos) {
            _showSocialMediaCard();
        } else {
            router.navigate('/(settings)');
        }
    };

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

    const _handleGoToProfile = (id: string) => {
        _router.push({
            pathname: '/(user)/UserProfile',
            params: {userId: id},
        });
    };
    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                {loading && (<OverlaySpinner visible={true}/>)}
                <View style={styles.mainContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}
                                contentContainerStyle={{alignItems: 'center'}}
                                style={{width: '100%', flex: 1}}>
                        <View style={styles.profileImageContainer}>
                            <View style={styles.imageContainer}>
                                {currentUser?.imageUrl ? (
                                    <Avatar.Image size={hp(20)} source={{uri: currentUser.imageUrl}}/>
                                ) : (
                                    <Avatar.Text
                                        size={hp(20)}
                                        label={`${currentUser?.firstName?.[0] ?? ''}${currentUser?.lastName?.[0] ?? ''}`.toUpperCase() || ""}
                                    />
                                )}
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    fontSize: 18
                                }}>    {`${currentUser?.firstName?.charAt(0).toUpperCase() || ""}${currentUser?.firstName?.slice(1).toLowerCase() || ""} ${currentUser?.lastName?.charAt(0).toUpperCase() || ""}${currentUser?.lastName?.slice(1).toLowerCase() || ""}`}
                                </Text>
                                <Text style={{color: 'grey', fontSize: 16, marginTop: 5}}>
                                    {`${currentUser?.city || ''}${currentUser?.city && currentUser?.stateRegion ? ', ' : ''}${currentUser?.stateRegion || ''}${currentUser?.stateRegion && currentUser?.country ? ', ' : ''}${currentUser?.country || ''}`}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.bioContainer}>
                            <Text style={{fontWeight: 'bold', fontSize: 16}}>Bio:</Text>
                            <Text style={{fontSize: 14, textAlign: 'center'}}>{currentUser?.bio || ""}</Text>
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
                            {currentUser?.role != UserType[UserType.PARENT] ?
                                (<TouchableOpacity onPress={() => _option(MenuOption.Sports_Profiles)}>
                                    <Text
                                        style={[styles.selectionText, selectOption == MenuOption.Sports_Profiles && styles.selectedText]}>
                                        Sports Profile
                                    </Text>
                                    {selectOption == MenuOption.Sports_Profiles && <View style={styles.underline}/>}
                                </TouchableOpacity>) :
                                (<TouchableOpacity onPress={() => _option(MenuOption.Childrens)}>
                                    <Text
                                        style={[styles.selectionText, selectOption == MenuOption.Childrens && styles.selectedText]}>
                                        Childrens
                                    </Text>
                                    {selectOption == MenuOption.Childrens && <View style={styles.underline}/>}
                                </TouchableOpacity>)}
                        </View>
                        <Divider bold={true} style={{width: '90%', alignSelf: 'center', marginBottom: hp('2%')}}/>
                        <View style={{width: '90%', height: '23%'}}>
                            {selectOption === MenuOption.Overview && <>
                                <View style={{flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Sports Focus</Text>
                                        <Text style={styles.infoText}>{currentUser?.preferenceSport || ""}</Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Age</Text>
                                        <Text style={styles.infoText}>
                                            {currentUser?.dateOfBirth ? `${Helpers.calculateAge(currentUser?.dateOfBirth)} Years` : ""}
                                        </Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Positions</Text>
                                        <Text style={styles.infoText}>{currentUser?.positionCoached || ""}</Text>
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
                                        <Text style={styles.infoText}>
                                            {currentUser?.role === "COACH" ? userSport[0]?.sportLevel : currentUser?.skillLevel?.[0] ?? ""}
                                        </Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Followers</Text>
                                        <Text style={styles.infoText}>{currentUser?.followers?.length || 0}</Text>
                                    </View>
                                </View>
                            </>}
                            {selectOption == MenuOption.Videos && <>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    marginTop: 15,
                                    width: '100%'
                                }}>
                                    <TouchableOpacity
                                        onPress={() => currentUser?.socialMediaLinks?.instagramAccount && _handleOpenUrl(currentUser?.socialMediaLinks?.instagramAccount)}
                                        style={styles.iconCard}
                                        disabled={!currentUser?.socialMediaLinks?.instagramAccount}
                                    >
                                        <FontAwesome6
                                            name="instagram"
                                            size={40}
                                            color={currentUser?.socialMediaLinks?.instagramAccount ? "#E4405F" : "#cccccc"}
                                            style={{opacity: currentUser?.socialMediaLinks?.instagramAccount ? 1 : 0.5}}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => currentUser?.socialMediaLinks?.tiktokAccount && _handleOpenUrl(currentUser?.socialMediaLinks?.tiktokAccount)}
                                        style={styles.iconCard}
                                        disabled={!currentUser?.socialMediaLinks?.tiktokAccount}
                                    >
                                        <FontAwesome6
                                            name="tiktok"
                                            size={40}
                                            color={currentUser?.socialMediaLinks?.tiktokAccount ? "black" : "#cccccc"}
                                            style={{opacity: currentUser?.socialMediaLinks?.tiktokAccount ? 1 : 0.5}}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => currentUser?.socialMediaLinks?.facebookAccount && _handleOpenUrl(currentUser?.socialMediaLinks?.facebookAccount)}
                                        style={styles.iconCard}
                                        disabled={!currentUser?.socialMediaLinks?.facebookAccount}>
                                        <FontAwesome6
                                            name="facebook"
                                            size={40}
                                            color={currentUser?.socialMediaLinks?.facebookAccount ? "blue" : "#cccccc"}
                                            style={{opacity: currentUser?.socialMediaLinks?.facebookAccount ? 1 : 0.5}}
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
                                        onPress={() => currentUser?.socialMediaLinks?.youtubeAccount && _handleOpenUrl(currentUser?.socialMediaLinks?.youtubeAccount)}
                                        style={styles.iconCard}
                                        disabled={!currentUser?.socialMediaLinks?.youtubeAccount}>
                                        <FontAwesome6
                                            name="youtube"
                                            size={40}
                                            color={currentUser?.socialMediaLinks?.youtubeAccount ? "red" : "#cccccc"}
                                            style={{opacity: currentUser?.socialMediaLinks?.youtubeAccount ? 1 : 0.5}}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </>}
                            {selectOption === MenuOption.Sports_Profiles && <>
                                <View style={styles.sportsProfileContainer}>
                                    <View style={styles.sportsList}>
                                        {userSport?.map((sport, index) => (
                                            <View key={index} style={styles.sportItem}>
                                                <Text style={styles.sportName}>{sport.sportName}</Text>
                                                <Text style={styles.sportLevel}>Level: {sport.sportLevel}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    
                                    {(currentUser?.role === UserType[UserType.COACH] || currentUser?.role === UserType[UserType.ORGANIZATION]) && (
                                        <View style={styles.trainingLocationsContainer}>
                                            <View style={styles.sectionHeader}>
                                                <Text style={styles.sectionTitle}>Training Locations</Text>
                                                <TouchableOpacity 
                                                    style={styles.manageButton}
                                                    onPress={() => router.push('/(user)/ManageTrainingLocations')}>
                                                    <Text style={styles.manageButtonText}>Manage Locations</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.locationsList}>
                                                {/* This will be populated with actual locations data */}
                                                {(userSport[0]?.trainingLocations && userSport[0].trainingLocations.length > 0) ? (
                                                    <Text style={styles.noLocationsText}>
                                                        You currently have {userSport[0].trainingLocations.length} location{userSport[0].trainingLocations.length > 1 ? 's' : ''}.
                                                    </Text>
                                                ) : (currentUser?.trainingLocations && currentUser.trainingLocations.length > 0) ? (
                                                    <Text style={styles.noLocationsText}>
                                                        You currently have {currentUser.trainingLocations.length} location{currentUser.trainingLocations.length > 1 ? 's' : ''}.
                                                    </Text>
                                                ) : (
                                                    <Text style={styles.noLocationsText}>No training locations added yet</Text>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </>}
                            {selectOption === MenuOption.Childrens &&
                                <View style={{width: '100%'}}>
                                    <FlatList
                                        data={currentUser?.children}
                                        numColumns={3}
                                        keyExtractor={(item, index) => item.id.toString()}
                                        scrollEnabled={false}
                                        contentContainerStyle={{
                                            justifyContent: 'space-around',
                                            paddingHorizontal: 10, // Adjust to control horizontal spacing
                                        }}
                                        columnWrapperStyle={{
                                            justifyContent: 'space-around', // Space between items in a row
                                        }}
                                        renderItem={({item}) => (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    _handleGoToProfile(item.id);
                                                }}
                                                disabled={true}
                                                style={[styles.infoMiniCard]}>
                                                {item.imageUrl ? (
                                                    <Avatar.Image size={50} source={{uri: item.imageUrl}}/>
                                                ) : (
                                                    <Avatar.Text
                                                        size={50}
                                                        label={(item.fullName.charAt(0) + item.fullName.charAt(1)).toUpperCase()}
                                                    />
                                                )}
                                                <Text style={{fontWeight: 'bold'}}>{item.fullName}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>}
                            {selectOption !== MenuOption.Sports_Profiles && (
                                <TouchableOpacity
                                    onPress={_handleSettings}
                                    style={styles.followBtn}>
                                    <FontAwesome6 name="gear" size={15} color="white"/>
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 16,
                                        marginLeft: 10,
                                        fontWeight: 'bold'
                                    }}>Settings</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </View>

                {/******User Social Medial links*******/}
                <Modal visible={isSocialMediaCardVisible} onDismiss={_hideSocialMediaCard}
                       contentContainerStyle={[styles.postModalContainer, {height: '60%'}]}>
                    <Text style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        marginTop: 20
                    }}>Link Social Media</Text>
                    <View style={{width: '97%', alignItems: 'center', marginTop: 10}}>
                        <TextInput
                            placeholder="Facebook"
                            style={[styles.inputStyle, {
                                marginTop: 10,
                                flexShrink: 1,  // Prevents wrapping
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='facebook' size={25}/>}
                            value={socialMediaLink.facebook}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, facebook: text})}
                            multiline={false}
                        />
                        <TextInput
                            placeholder="Instagram"
                            style={[styles.inputStyle, {
                                marginTop: 5,
                                flexShrink: 1,
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='instagram' size={25}/>}
                            value={socialMediaLink.instagram}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, instagram: text})}
                            multiline={false}
                        />
                        <TextInput
                            placeholder="Tiktok"
                            style={[styles.inputStyle, {
                                marginTop: 5,
                                flexShrink: 1,
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25}/>}
                            value={socialMediaLink.tiktok}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, tiktok: text})}
                            multiline={false}
                        />
                        <TextInput
                            placeholder="Youtube"
                            style={[styles.inputStyle, {
                                marginTop: 5,
                                flexShrink: 1,
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='youtube' size={25}/>}
                            value={socialMediaLink.youtube}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, youtube: text})}
                            multiline={false}
                        />
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '80%'}}>
                            <CustomButton
                                text="Cancel"
                                onPress={_hideSocialMediaCard}
                                style={{
                                    marginTop: 20,
                                    width: '40%',
                                    height: 35,
                                    backgroundColor: 'white',
                                    borderColor: '#ccc',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 2},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                                textStyle={{color: 'black'}}
                            />
                            <CustomButton
                                text="Save"
                                onPress={_handleSocialMediaLink}
                                style={{
                                    marginTop: 20,
                                    width: '40%',
                                    height: 35,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 2},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImageBackground>);
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Add padding for iOS
    },
    profileImageContainer: {
        backgroundColor: 'white',
        height: Platform.OS === 'ios' ? 320 : 300, // Slightly taller on iOS
        width: '90%',
        marginTop: hp(2),
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden', // Ensure content doesn't overflow rounded corners
    },
    imageContainer: {
        height: '70%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa', // Light background for image area
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 15,
        paddingHorizontal: 10,
    },
    bioContainer: {
        backgroundColor: 'white',
        minHeight: 80,
        width: '90%',
        marginTop: hp(2),
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        padding: 15,
    },
    selectedText: {
        color: '#2757CB',
        fontWeight: '600',
    },
    selectionText: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 5,
        color: '#666',
    },
    underline: {
        height: 3,
        backgroundColor: '#2757CB',
        marginTop: 5,
        borderRadius: 2,
    },
    infoMiniCard: {
        borderWidth: 0,
        padding: 15,
        backgroundColor: 'white',
        alignItems: 'center',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
        width: widthPercentageToDP('28%'),
        maxWidth: 110,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    infoText: {
        fontWeight: '600',
        color: '#2757CB',
        fontSize: 13,
    },
    followBtn: {
        backgroundColor: '#2757CB',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
        width: 150,
        padding: 12,
        borderRadius: 25,
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    iconCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 0,
    },
    postModalContainer: {
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 20,
        width: '95%',
        height: '100%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
        marginBottom: Platform.OS === 'ios' ? '30%' : '20%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 55,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderRadius: 15,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        width: '100%',
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 10,
    },
    sportsProfileContainer: {
        width: '100%',
        padding: 15,
    },
    sportsList: {
        marginBottom: 20,
    },
    sportItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
    },
    sportName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    sportLevel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    trainingLocationsContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    manageButton: {
        backgroundColor: '#2757CB',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    manageButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    locationsList: {
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noLocationsText: {
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default ProfileV2;