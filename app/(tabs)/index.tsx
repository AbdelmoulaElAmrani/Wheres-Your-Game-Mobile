import ReactNative, {FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {AntDesign, Feather, Fontisto, Ionicons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Helpers} from "@/constants/Helpers";
import {Player} from "@/models/Player";
import {ActivityIndicator, Avatar, MD2Colors} from "react-native-paper";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {getUserProfile, getUserSports} from "@/redux/UserSlice";
import UserType from "@/models/UserType";
import {Team} from "@/models/Team";
import {router, useRouter, useNavigation, useFocusEffect} from "expo-router";
import RNPickerSelect from 'react-native-picker-select';
import {TeamService} from "@/services/TeamService";
import {Image, ImageBackground} from "expo-image";
import {NotificationService} from "@/services/NotificationService";
import {NOTIFICATION_REFRESH_TIMER} from "@/appConfig";
import {SportService} from "@/services/SportService";
import OverlaySpinner from "@/components/OverlaySpinner";
import {OrganizationService} from "@/services/OrganizationService";
import isEqual from 'lodash/isEqual';


const REFRESH_NOTIFICATION_TIME = NOTIFICATION_REFRESH_TIMER * 1000;


interface UserProfileProps {
    userId: string,
    sports: UserSportResponse[] | undefined,
    teams: Team[] | undefined
    coaches: UserResponse[] | undefined
}

const Home = () => {
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const loading = useSelector((state: any) => state.user.loading) as boolean;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const dispatch = useDispatch();
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
    const [playersLoading, setPlayersLoading] = useState<boolean>(false)
    const _router = useRouter();
    const [newNotif, setNewNotif] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [selectedSport, setSelectedSport] = useState<string | undefined>(undefined);
    const [selectedCoach, setSelectedCoach] = useState<UserResponse | undefined>(undefined);
    const [tempSelectedProfileId, setTempSelectedProfileId] = useState<string>('');
    const [selectedProfile, setSelectedProfile] = useState<UserProfileProps>({
        sports: [],
        teams: [],
        userId: '',
        coaches: []
    });

    const isFocused = useNavigation().isFocused();
    const isValidUser = (user: any) => user && user.id;

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const id = selectedProfileId || userData?.id;

            const load = async () => {
                if (!isValidUser(userData)) {
                    dispatch(getUserProfile() as any);
                    return;
                }

                try {
                    setIsLoading(true);

                    // Conditionally load user sports
                    let sports = selectedProfile.sports;
                    if (
                        selectedProfile.userId !== id ||
                        !selectedProfile.sports?.length ||
                        (id === userData?.id && userSport.length !== selectedProfile.sports.length)
                    ) {
                        sports = id === userData?.id ? userSport : await SportService.getUserSport(id);
                    }

                    // Conditionally load teams
                    let teams = selectedProfile.teams;
                    if (!teams?.length || selectedProfile.userId !== id) {
                        teams = await TeamService.getUserTeams(id);
                    }

                    // Only update profile if changed
                    const hasChanged =
                        selectedProfile.userId !== id ||
                        !Helpers.profileArraysEqual(selectedProfile.sports, sports) ||
                        !Helpers.profileArraysEqual(selectedProfile.teams, teams);

                    if (hasChanged) {
                        setSelectedProfile({
                            userId: id,
                            sports,
                            teams,
                            coaches: [], // Add coach logic as needed
                        });
                        setSelectedTeam(undefined);
                        setPlayers([]);
                    }

                    await checkForNotification();
                } catch (e) {
                    console.error('useFocusEffect error:', e);
                } finally {
                    if (isActive) setIsLoading(false);
                }
            };

            load();

            const intervalId = setInterval(checkForNotification, REFRESH_NOTIFICATION_TIME);

            return () => {
                isActive = false;
                clearInterval(intervalId);
                setPlayers([]);
                setSelectedTeam(undefined);
            };
        }, [selectedProfileId, userData?.id, userSport])
    );

    const checkForNotification = async () => {
        try {
            if (!newNotif && userData?.id) {
                const res = await NotificationService.getNotifications();
                setNewNotif(res ? res.some(x => !x.isRead) : false);
            }
        } catch (e) {
            console.error(e);
        }
    }


    const _getMyTeams = async (userId: string, sportId?:string) => {
        try {
            const organizationId = isOrganization() ? userData.id : undefined;
            const result = await TeamService.getUserTeams(userId, sportId, organizationId);
            setSelectedProfile(prev => ({...prev, teams: result}));
        } catch (e) {
            console.error('_getMyTeams', e);
        } finally {
            setSelectedTeam(undefined);
            setPlayers([]);
        }
    }

    const _getAllPlayerOfSelectedTeam = async (team?: Team | undefined) => {
        try {
            const id = team?.id ?? selectedTeam?.id;
            if (id) {
                setPlayersLoading(true);
                const teamPlayers = await TeamService.getTeamPlayers(id);
                setPlayers(teamPlayers);
            } else {
                setPlayers([]);
            }
        } catch (e) {
            console.error('_getAllPlayerOfSelectedTeam', e);
        } finally {
            setPlayersLoading(false);
        }
    }


    const _handleOnOpenSearch = () => {
        router.navigate('/(user)/(search)/SearchGlobal');
    }
    const _onOpenNotification = () => {
        setNewNotif(false);
        router.navigate('/(user)/Notifications');
    }

    const _onOpenChat = () => {
        router.navigate('/(user)/(Chat)/Chats');
    }

    const _onOpenMap = () => {
        router.navigate('/(map)');
    }

    const _onSearch = (searchType: UserType) => {
        _router.push({
            pathname: '/(user)/(search)/SearchUser',
            params: {searchType: UserType[searchType]},
        });
    }

    const _onOpenAdRequest = () => {
        router.navigate('/(organization)');
    }

    const _onAddPlayer = () => {
        _onSearch(UserType.PLAYER);
    }

    const _onAddTeam = () => {
        router.navigate('/(team)/TeamForm');
    }

    const _onSelectSport = async (id: any) => {
        if (isOrganization()) {
            if (selectedSport == id) {
                setSelectedSport(undefined);

                setSelectedCoach(undefined);
                setSelectedProfile(prev => ({...prev, coaches: [], teams: []}));

                setSelectedTeam(undefined);

                setPlayers([]);

            } else {
                setSelectedSport(id);
                const data = await OrganizationService.getAllCoachesOfThisSport(userData.id, id);
                setSelectedProfile(prev => ({...prev, coaches: data}));
            }
        }
    }

    const _onSelectCoach = async (coach: UserResponse) => {
        if (!isOrganization()) return;
        if (selectedCoach?.id == coach.id) {
            setSelectedCoach(undefined)
            setSelectedTeam(undefined);
            setSelectedProfile(prev => ({...prev, teams: []}));
            setPlayers([]);
        } else {
            try {
                setSelectedCoach(coach);
                await _getMyTeams(coach.id, selectedSport);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const _onSelectTeam = async (team: Team) => {
        if (selectedTeam?.id == team.id) {
            setSelectedTeam(undefined);
            setPlayers([]);
        } else {
            try {
                setSelectedTeam(team);
                await _getAllPlayerOfSelectedTeam(team);
            } catch (e) {
                console.error(e);
            }
        }
    }
    const _onSelectPlayer = (player: Player | undefined) => {
        if (player?.id) {
            _router.push({
                pathname: '/(user)/UserProfile',
                params: {userId: player.id},
            });
        }
    }

    /*const _onSelectCategory = (category: any) => {
    }*/


    const isCoach = (): boolean => userData.role == UserType[UserType.COACH];
    const isOrganization = (): boolean => userData.role == UserType[UserType.ORGANIZATION];

    const isPlayersVisible = (): boolean =>
        selectedTeam !== undefined;


    const _renderSportItem = memo(({item}: { item: UserSportResponse }) => {
        return (<TouchableOpacity
            disabled={!isOrganization()}
            style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}
            onPress={() => _onSelectSport(item.id.sportId)}>
            <View style={[styles.circle, selectedSport == item.id.sportId && styles.selectedTag]}>
                <Image
                    placeholder={require('../../assets/images/sport/sport.png')}
                    placeholderContentFit={'contain'}
                    source={{uri: item.iconUrl}}
                    style={styles.iconImage}/>
            </View>
            <Text
                style={[styles.tagText, selectedSport == item.id.sportId && {fontWeight: 'bold'}]}>{item.sportName}</Text>
        </TouchableOpacity>);
    });

    const _renderCoaches = memo(({item}: { item: UserResponse }) => {
        return (
            <TouchableOpacity
                style={[styles.card, selectedCoach?.id == item.id ? styles.selectedTag : null]}
                onPress={() => _onSelectCoach(item)}>
                <View>
                    <View style={styles.cardImage}>
                        {item.imageUrl ? (
                            <Avatar.Image size={60} source={{uri: item.imageUrl}}/>
                        ) : (
                            <Avatar.Text
                                size={60}
                                label={(item.firstName.charAt(0) + item.lastName.charAt(1)).toUpperCase()}
                            />
                        )}
                    </View>
                </View>
                <Text style={{
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: "600",
                    marginTop: 10,
                    width: 105
                }}>{`${item.firstName} ${item.lastName}`}</Text>
            </TouchableOpacity>
        )
    });

    const _renderTeam = memo(({item}: { item: Team }) => {
        return (
            <TouchableOpacity
                style={[styles.card, selectedTeam?.id == item.id ? styles.selectedTag : null]}
                onPress={() => _onSelectTeam(item)}>
                <View>
                    <View style={styles.cardImage}>
                        {item.imgUrl ? (
                            <Avatar.Image size={60} source={{uri: item.imgUrl}}/>
                        ) : (
                            <Avatar.Text
                                size={60}
                                label={(() => {
                                    const nameParts = item.name.trim().split(' ').filter(Boolean);
                                    if (nameParts.length >= 2) {
                                        // Take the first character of each part and combine them
                                        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
                                    } else {
                                        // If there is only one word, take the first two characters
                                        return (item.name.charAt(0) + item.name.charAt(1)).toUpperCase();
                                    }
                                })()}/>
                        )}
                    </View>
                </View>
                <Text style={{
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: "600",
                    marginTop: 10,
                    width: 105,
                    color: selectedTeam?.id == item.id ? 'white' : 'black'
                }}>{item.name}</Text>
            </TouchableOpacity>
        )
    });

    const _renderPlayer = memo(({item}: { item: Player }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => _onSelectPlayer(item)}>
            <View>
                <View style={styles.cardImage}>
                    {item.imageUrl ? (
                        <Avatar.Image size={60} source={{uri: item.imageUrl}}/>
                    ) : (
                        <Avatar.Text
                            size={60}
                            label={(item.firstName.charAt(0) + item.lastName.charAt(1)).toUpperCase()}
                        />
                    )}
                </View>
            </View>
            <Text style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: "600",
                marginTop: 10,
                width: 105
            }}>{`${item.firstName} ${item.lastName}`}</Text>
        </TouchableOpacity>
    ));

    /* const _renderCategory = memo(({item}: { item: any }) => (
         <TouchableOpacity
             disabled={true}
             style={styles.categoryContainer}
             onPress={() => _onSelectCategory(item)}>
             <Text style={{fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: 'white'}}>{item}</Text>
         </TouchableOpacity>
     ));*/

    const _handleOpenInviteChild = () => {
        _onSearch(UserType.PARENT);
    }

    return (
        <>
            <StatusBar style="light"/>
            <ImageBackground
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    flex: 1,
                }}
                source={require('../../assets/images/signupBackGround.jpg')}>
                {(loading || isLoading) && isFocused && (
                    <OverlaySpinner visible={true}/>
                )}
                <SafeAreaView style={{height: hp(100)}}>
                    <View style={styles.headerContainer}>
                        <View>
                            <TouchableOpacity onPress={_handleOnOpenSearch}>
                                <Feather name="search" size={30} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginLeft: 25}}>
                            <ReactNative.Image style={styles.logoContainer}
                                               source={require('../../assets/images/homeLogo.png')}/>

                            {userData.role == UserType[UserType.PARENT] && <TouchableOpacity
                                onPress={_handleOpenInviteChild}
                                style={{borderColor: 'white', borderWidth: 0.5, marginTop: 1, borderRadius: 5}}>
                                <Text style={{color: 'white', textAlign: 'center', fontSize: 16, paddingVertical: 5}}>Invite
                                    Child</Text>
                            </TouchableOpacity>}
                        </View>
                        <View style={styles.sideHiderContainer}>
                            <TouchableOpacity
                                onPress={_onOpenNotification}
                                style={{marginRight: 20}}>
                                <Fontisto name={newNotif ? "bell-alt" : "bell"} size={30}
                                          color={newNotif ? "red" : "white"}/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onOpenChat}>
                                <Ionicons name="chatbubble-ellipses-outline" size={30} color="white"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        marginTop: 35,
                        marginHorizontal: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 18
                        }}>Hi {`${Helpers.capitalize(userData?.firstName)}`}</Text>
                        {userData.role == UserType[UserType.PARENT] &&
                            <View style={{
                                borderWidth: 1,
                                borderColor: 'white',
                                borderRadius: 4,
                            }}>
                                <RNPickerSelect
                                    placeholder={{
                                        label: 'Me',
                                        value: '',
                                        color: '#9EA0A4',
                                    }}
                                    value={Platform.OS === 'ios' ? tempSelectedProfileId : selectedProfileId}
                                    items={userData?.children?.map(child => ({
                                        label: child.fullName,
                                        value: child.id,
                                        id: child.id,
                                        color: '#9EA0A4',
                                    })) || []}
                                    onValueChange={(value, index) => {
                                        if (Platform.OS === 'ios') {
                                            setTempSelectedProfileId(value); // store in temp
                                        } else {
                                            setSelectedProfileId(value); // update directly for Android
                                        }
                                    }}
                                    onDonePress={() => {
                                        if (Platform.OS === 'ios') {
                                            setSelectedProfileId(tempSelectedProfileId);
                                            setTempSelectedProfileId(tempSelectedProfileId);
                                        }
                                    }}
                                    onClose={() => {
                                        setTempSelectedProfileId(selectedProfileId);
                                    }}
                                    style={pickerSelectStyles}
                                    Icon={() => (
                                        <Ionicons
                                            name="chevron-down"
                                            size={24}
                                            color="white"
                                            style={{position: 'absolute', top: '50%', marginTop: 5, right: 10}}
                                        />
                                    )}
                                />
                            </View>
                        }
                    </View>
                    <View style={styles.mainContainer}>
                        <View style={{marginBottom: 10, flexDirection: 'row', justifyContent: 'center'}}>
                            <TouchableOpacity
                                onPress={() => _onSearch(UserType.COACH)}
                                style={styles.tag}>
                                <Text style={styles.tagText}>Add Coach</Text>
                            </TouchableOpacity>
                            {isOrganization() && <TouchableOpacity
                                onPress={_onOpenAdRequest}
                                style={[styles.tag, {paddingHorizontal: 40}]}>
                                <Text style={styles.tagText}>Advertising</Text>
                            </TouchableOpacity>}
                            {isCoach() && <TouchableOpacity
                                onPress={() => _onSearch(UserType.PLAYER)}
                                style={styles.tag}>
                                <Text style={styles.tagText}>Add Player</Text>
                            </TouchableOpacity>}
                            {isCoach() && <TouchableOpacity
                                onPress={_onAddTeam} style={styles.tag}>
                                <Text style={styles.tagText}>Add Team</Text>
                            </TouchableOpacity>}
                            <TouchableOpacity onPress={_onOpenMap} style={styles.tag}>
                                <Text style={styles.tagText}>Map View</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={{flex: 1}}
                            showsVerticalScrollIndicator={true}>
                            <View style={styles.menuContainer}>
                                <View style={styles.menuTitleContainer}>
                                    <Text style={styles.menuTitle}>Your Sports <Text
                                        style={styles.count}>{selectedProfile?.sports?.length || 0}</Text></Text>
                                </View>
                                <FlatList
                                    data={selectedProfile?.sports}
                                    renderItem={({item}) => <_renderSportItem item={item}/>}
                                    keyExtractor={item => item.sportId + item.sportName}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    focusable={true}
                                    nestedScrollEnabled={true}
                                />
                            </View>
                            {isOrganization() && <View style={styles.menuContainer}>
                                <View style={styles.menuTitleContainer}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.menuTitle}>Your Coaches <Text
                                            style={styles.count}>{selectedProfile?.coaches?.length || 0}</Text></Text>
                                    </View>
                                </View>
                                <FlatList
                                    data={selectedProfile?.coaches}
                                    renderItem={({item}) => <_renderCoaches item={item}/>}
                                    keyExtractor={item => item.id}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    focusable={true}
                                    nestedScrollEnabled={true}
                                />
                            </View>}
                            {((!isOrganization()) || (isOrganization() && (selectedProfile?.teams?.length ?? 0) > 0)) &&
                                <View style={styles.menuContainer}>
                                    <View style={styles.menuTitleContainer}>
                                        <View style={{flexDirection: 'row'}}>
                                            <Text style={styles.menuTitle}>Your Teams <Text
                                                style={styles.count}>{selectedProfile.teams?.length}</Text></Text>
                                        </View>
                                        {isCoach() && <TouchableOpacity
                                            onPress={_onAddTeam}
                                            style={styles.btnContainer}>
                                            <Text style={styles.btnText}>Add Team</Text>
                                            <AntDesign name="right" size={20} color="#4361EE"/>
                                        </TouchableOpacity>}
                                    </View>
                                    <FlatList
                                        data={selectedProfile?.teams}
                                        renderItem={({item}) => <_renderTeam item={item}/>}
                                        keyExtractor={item => item.id}
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                        focusable={true}
                                        nestedScrollEnabled={true}
                                    />
                                </View>}
                            {isPlayersVisible() && <View style={styles.menuContainer}>
                                <View style={styles.menuTitleContainer}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.menuTitle}>{isCoach() ? 'Your ' : ''}Players <Text
                                            style={styles.count}>{players?.length}</Text></Text>
                                    </View>
                                    {isCoach() && !playersLoading && <TouchableOpacity
                                        onPress={_onAddPlayer}
                                        style={styles.btnContainer}>
                                        <Text style={styles.btnText}>Add Player</Text>
                                        <AntDesign name="right" size={20} color="#4361EE"/>
                                    </TouchableOpacity>}
                                </View>
                                {playersLoading ? (
                                        <ActivityIndicator animating={true} color={MD2Colors.blueA700} size={35}/>) :
                                    (<FlatList
                                        data={players}
                                        renderItem={({item}) => <_renderPlayer item={item}/>}
                                        keyExtractor={item => item.id}
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                        focusable={true}
                                        nestedScrollEnabled={true}
                                    />)}
                            </View>}

                            <View style={[styles.menuContainer, {marginBottom: 100}]}>
                                {/*<View style={styles.menuTitleContainer}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.menuTitle}>Explore by Categories</Text>
                                    </View>
                                    <TouchableOpacity
                                        disabled={true}
                                        onPress={_onViewAll}
                                        style={styles.btnContainer}>
                                        <Text style={[styles.btnText, {color: 'grey'}]}>View All</Text>
                                        <AntDesign name="right" size={20} color="grey"/>
                                    </TouchableOpacity>
                                </View>

                                <View>
                                    <FlatList
                                        nestedScrollEnabled={true}
                                        scrollEnabled={false}
                                        data={categories}
                                        renderItem={({item}) => <_renderCategory item={item}/>}
                                        numColumns={2}
                                        keyExtractor={(item) => item}
                                    />
                                </View>*/}
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </>
    );
}


const styles = StyleSheet.create({

    headerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopEndRadius: 35,
        borderTopStartRadius: 35,
        paddingTop: 30,
        padding: 20,
        marginTop: 20,
        width: wp(100)
    },
    sideHiderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tag: {
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginRight: 5
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
    },

    selectedTag: {
        backgroundColor: '#0041e8',
    },
    menuTitleContainer: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 15
    },
    menuTitle: {
        fontWeight: '900',
        fontSize: 18
    },
    count: {
        fontWeight: "bold",
        fontSize: 18,
        color: 'grey'
    },
    btnText: {
        color: '#4361EE',
        fontSize: 18
    },
    btnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuContainer: {
        marginTop: 10,
    },
    card: {
        backgroundColor: 'white',
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        margin: 6
    },
    cardImage: {
        height: 65,
        width: 85,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circle: {
        borderWidth: 1,
        borderColor: '#E9EDF9',
        marginHorizontal: 8,
        height: 60,
        width: 60,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconImage: {
        height: '70%',
        width: '70%',
        //resizeMode: 'cover',
    },
    categoryContainer: {
        backgroundColor: 'rgba(82,80,80,0.22)',
        width: 160,
        height: 90,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    }
});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        width: 140,
        paddingHorizontal: 10,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputAndroid: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: 170,
    },
});

export default Home;