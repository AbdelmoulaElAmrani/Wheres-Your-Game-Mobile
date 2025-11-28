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
import {UserService} from "@/services/UserService";
import {Image, ImageBackground} from "expo-image";
import {NotificationService} from "@/services/NotificationService";
import {NOTIFICATION_REFRESH_TIMER} from "@/appConfig";
import {SportService} from "@/services/SportService";
import OverlaySpinner from "@/components/OverlaySpinner";
import {OrganizationService} from "@/services/OrganizationService";
import BannerAdComponent from "@/components/BannerAd";

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
    const [friendPlayers, setFriendPlayers] = useState<Player[]>([]);
    const [playerTeamStatus, setPlayerTeamStatus] = useState<Record<string, boolean>>({});
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
    const [playersLoading, setPlayersLoading] = useState<boolean>(false)
    const [friendPlayersLoading, setFriendPlayersLoading] = useState<boolean>(false);
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
                    await dispatch(getUserProfile() as any);
                    return;
                }

                try {
                    setIsLoading(true);

                    if (id === userData?.id && userSport?.length <= 0) {
                        await dispatch(getUserSports(userData.id) as any);
                        return;
                    }

                    let sports = selectedProfile.sports;
                    let teams = selectedProfile.teams;

                    if (id === userData?.id) {
                        sports = userSport || [];
                    } else {
                        // Fetch sports for other users only if we don't have them
                        if (selectedProfile.userId !== id || !selectedProfile.sports?.length) {
                            sports = await SportService.getUserSport(id);
                        }
                    }

                    // Always reload teams when viewing own profile, or if no teams exist, or if viewing different user
                    if (id === userData?.id || !teams?.length || selectedProfile.userId !== id) {
                        teams = await TeamService.getUserTeams(id);
                    }

                    // Load coaches for organizations (all coaches when no sport selected)
                    let coaches: UserResponse[] = selectedProfile.coaches || [];
                    if (isOrganization() && id === userData?.id) {
                        if (!selectedSport) {
                            // Load all coaches when no sport is selected
                            const allCoaches = await OrganizationService.getCoachesByOrganization(userData.id);
                            coaches = allCoaches || [];
                        } else {
                            // Coaches will be loaded when sport is selected in _onSelectSport
                            coaches = selectedProfile.coaches || [];
                        }
                    }

                    // Only update profile if changed
                    const hasChanged =
                        selectedProfile.userId !== id ||
                        !Helpers.profileArraysEqual(selectedProfile.sports, sports) ||
                        !Helpers.profileArraysEqual(selectedProfile.teams, teams) ||
                        !Helpers.profileArraysEqual(selectedProfile.coaches, coaches);

                    if (hasChanged) {
                        setSelectedProfile({
                            userId: id,
                            sports,
                            teams,
                            coaches: coaches || [],
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
        }, [selectedProfileId, userData?.id, userSport?.length])
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

    const _loadFriendPlayers = async () => {
        if (!userData?.id || !isCoach()) {
            console.log('_loadFriendPlayers: Skipping - userData?.id:', userData?.id, 'isCoach():', isCoach());
            return;
        }
        try {
            console.log('_loadFriendPlayers: Starting - userId:', userData.id);
            setFriendPlayersLoading(true);
            const friends = await UserService.getFriends(userData.id);
            console.log('_loadFriendPlayers: getFriends() result:', friends);
            console.log('_loadFriendPlayers: friends length:', friends?.length);
            
            if (friends) {
                // Debug: Log all friend roles to see what we're getting
                console.log('_loadFriendPlayers: All friends with roles:', friends.map(f => ({ 
                    name: `${f.firstName} ${f.lastName}`, 
                    role: f.role, 
                    roleType: typeof f.role,
                    expectedRoleString: 'PLAYER',
                    UserTypeEnumValue: UserType[UserType.PLAYER],
                    matchesString: f.role === 'PLAYER',
                    matchesEnum: f.role === UserType[UserType.PLAYER]
                })));
                
                // Filter to only players
                // Role comes as a string from the API, compare with both string and enum value
                const playerFriends = friends.filter(friend => {
                    const roleStr = friend.role?.toString().toUpperCase() || '';
                    const isPlayer = roleStr === 'PLAYER' || friend.role === UserType[UserType.PLAYER];
                    console.log(`_loadFriendPlayers: Friend ${friend.firstName} ${friend.lastName} - role: "${friend.role}" -> normalized: "${roleStr}", isPlayer: ${isPlayer}`);
                    return isPlayer;
                }) as Player[];
                console.log('_loadFriendPlayers: Filtered player friends:', playerFriends);
                console.log('_loadFriendPlayers: Player friends length:', playerFriends.length);
                setFriendPlayers(playerFriends);
                
                // Check team assignment for each player
                const teamStatusMap: Record<string, boolean> = {};
                for (const player of playerFriends) {
                    const hasTeams = await TeamService.checkPlayerHasTeams(player.id);
                    teamStatusMap[player.id] = hasTeams;
                    console.log(`_loadFriendPlayers: Player ${player.firstName} ${player.lastName} (${player.id}) has teams:`, hasTeams);
                }
                console.log('_loadFriendPlayers: Team status map:', teamStatusMap);
                setPlayerTeamStatus(teamStatusMap);
            } else {
                console.log('_loadFriendPlayers: No friends returned from API');
            }
        } catch (e) {
            console.error('_loadFriendPlayers: Error loading friend players:', e);
        } finally {
            setFriendPlayersLoading(false);
            console.log('_loadFriendPlayers: Finished loading');
        }
    };

    // Load friend players for coaches
    useEffect(() => {
        console.log('useEffect [friend players]: userData?.role:', userData?.role, 'UserType.COACH:', UserType[UserType.COACH]);
        console.log('useEffect [friend players]: userData?.id:', userData?.id, 'selectedTeam:', selectedTeam);
        const shouldLoad = userData?.role === UserType[UserType.COACH] && userData?.id && !selectedTeam;
        console.log('useEffect [friend players]: shouldLoad:', shouldLoad);
        if (shouldLoad) {
            console.log('useEffect [friend players]: Calling _loadFriendPlayers()');
            _loadFriendPlayers();
        } else {
            console.log('useEffect [friend players]: Clearing friend players');
            setFriendPlayers([]);
            setPlayerTeamStatus({});
        }
    }, [userData?.id, userData?.role, selectedTeam]);

    // Automatically load all players when teams are available and no team is selected
    useEffect(() => {
        if (selectedTeam === undefined && 
            selectedProfile?.teams && 
            selectedProfile.teams.length > 0 && 
            !playersLoading) {
            // Only load if players array is empty (to avoid reloading unnecessarily)
            if (players.length === 0) {
                _getAllPlayerOfSelectedTeam(undefined);
            }
        }
    }, [selectedProfile?.teams?.length, selectedTeam]);


    const _getMyTeams = async (userId: string, sportId?: string, organizationId?: string) => {
        try {
            // Only use organizationId filter when viewing organization's own teams, not when viewing a coach's teams
            const orgId = organizationId !== undefined ? organizationId : (isOrganization() && !selectedCoach ? userData.id : undefined);
            const result = await TeamService.getUserTeams(userId, sportId, orgId);
            console.log('_getMyTeams: userId:', userId, 'sportId:', sportId, 'organizationId:', orgId, 'result:', result);
            setSelectedProfile(prev => ({...prev, teams: result || []}));
            // After loading teams, if no team is selected, load all players from all teams
            setSelectedTeam(undefined);
            if (result && result.length > 0) {
                await _getAllPlayerOfSelectedTeam(undefined);
            } else {
                setPlayers([]);
            }
        } catch (e) {
            setSelectedProfile(prev => ({...prev, teams: []}));
            console.error('_getMyTeams', e);
            setSelectedTeam(undefined);
            setPlayers([]);
        }
    }

    const _getAllPlayerOfSelectedTeam = async (team?: Team | undefined) => {
        try {
            const id = team?.id ?? selectedTeam?.id;
            if (id) {
                // Fetch players for a specific team
                setPlayersLoading(true);
                const teamPlayers = await TeamService.getTeamPlayers(id);
                setPlayers(teamPlayers || []);
            } else {
                // No team selected - fetch players from all teams
                setPlayersLoading(true);
                const allTeams = selectedProfile?.teams || [];
                if (allTeams.length > 0) {
                    // Fetch players from all teams and combine them
                    const allPlayersPromises = allTeams.map(team => TeamService.getTeamPlayers(team.id));
                    const allPlayersResults = await Promise.all(allPlayersPromises);
                    // Flatten the array and remove duplicates based on player id
                    const allPlayers = allPlayersResults
                        .flat()
                        .filter((player, index, self) => 
                            index === self.findIndex(p => p.id === player.id)
                        );
                    setPlayers(allPlayers || []);
                } else {
                    setPlayers([]);
                }
            }
        } catch (e) {
            console.error('_getAllPlayerOfSelectedTeam', e);
            setPlayers([]);
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
        // @ts-ignore
        router.navigate('/(organization)');
    }

    const _onAddPlayer = () => {
        _onSearch(UserType.PLAYER);
    }

    const _onAddTeam = () => {
        router.navigate('/(team)/TeamForm');
    }

    const _resetSelectedSport = async () => {
        setSelectedSport(undefined);
        setSelectedCoach(undefined);
        setSelectedTeam(undefined);
        setPlayers([]);
        
        // Reload all teams when resetting sport filter (no sport filter)
        const id = selectedProfileId || userData?.id;
        if (id) {
            // For organizations, reload all coaches when no sport is selected
            let coaches: UserResponse[] = [];
            if (isOrganization()) {
                const allCoaches = await OrganizationService.getCoachesByOrganization(userData.id);
                coaches = allCoaches || [];
                // Load all teams for the organization (with organizationId filter)
                await _getMyTeams(id, undefined, userData.id);
            } else {
                // For non-organizations, load teams without organization filter
                await _getMyTeams(id, undefined, undefined);
            }
            
            setSelectedProfile(prev => ({...prev, coaches}));
        } else {
            setSelectedProfile(prev => ({...prev, coaches: [], teams: []}));
        }
    }
    const _onSelectSport = async (id: any) => {
        if (selectedSport == id) {
            // If same sport is clicked, deselect it and show all teams
            await _resetSelectedSport();
        } else {
            // Select new sport and filter teams
            setSelectedSport(id);
            
            if (isOrganization()) {
                // For organizations, also load coaches for this sport
                const data = await OrganizationService.getAllCoachesOfThisSport(userData.id, id);
                setSelectedProfile(prev => ({...prev, coaches: data}));
                _resetSelectedCoach();
                
                // If a coach is selected, filter teams by coach and sport
                // Otherwise, filter teams by organization and sport
                if (selectedCoach) {
                    await _getMyTeams(selectedCoach.id, id, undefined);
                } else {
                    await _getMyTeams(selectedProfileId || userData?.id, id, userData.id);
                }
            } else {
                // Filter teams for non-organizations based on selected sport
                await _getMyTeams(selectedProfileId || userData?.id, id);
            }
        }
    }

    const _resetSelectedCoach = async () => {
        setSelectedCoach(undefined);
        setSelectedTeam(undefined);
        setPlayers([]);
        // Teams will be reloaded by the caller
    }

    const _onSelectCoach = async (coach: UserResponse) => {
        if (!isOrganization()) return;
        if (selectedCoach?.id == coach.id) {
            // Deselecting coach - show all teams for the organization
            _resetSelectedCoach();
            // When showing organization's teams, pass organizationId
            await _getMyTeams(selectedProfileId || userData?.id, selectedSport, userData.id);
        } else {
            try {
                setSelectedCoach(coach);
                console.log('_onSelectCoach: Selected coach:', coach.firstName, coach.lastName, 'coach.id:', coach.id);
                // Filter teams by selected coach and sport (if sport is selected)
                // Don't pass organizationId when viewing a coach's teams - we want ALL teams for that coach
                await _getMyTeams(coach.id, selectedSport, undefined);
            } catch (e) {
                console.error('_onSelectCoach: Error:', e);
            } finally {
            }
        }
    }

    const _onSelectTeam = async (team: Team) => {
        if (selectedTeam?.id == team.id) {
            // Deselecting the team - show all players from all teams
            setSelectedTeam(undefined);
            await _getAllPlayerOfSelectedTeam(undefined);
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

    const isCoach = (): boolean => userData?.role == UserType[UserType.COACH];
    const isOrganization = (): boolean => userData?.role == UserType[UserType.ORGANIZATION];

    const isPlayersVisible = (): boolean => {
        // Show players section if:
        // 1. A team is selected, OR
        // 2. No team is selected but there are teams available (to show all players), OR
        // 3. Coach has friend players (when no team is selected)
        const hasTeamPlayers = selectedTeam !== undefined || 
                               (selectedTeam === undefined && (selectedProfile?.teams?.length || 0) > 0);
        const hasFriendPlayers = isCoach() && selectedTeam === undefined && friendPlayers.length > 0;
        return hasTeamPlayers || hasFriendPlayers;
    }

    const _renderSportItem = memo(({item}: { item: UserSportResponse }) => {
        return (<TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}
            onPress={() => _onSelectSport(item.sportId)}>
            <View style={[styles.circle, selectedSport == item.sportId && styles.selectedTag]}>
                <Image
                    placeholder={require('../../assets/images/sport/sport.png')}
                    placeholderContentFit={'contain'}
                    source={{uri: item.iconUrl}}
                    style={styles.iconImage}/>
            </View>
            <Text
                style={[styles.tagText, selectedSport == item.sportId && {fontWeight: 'bold', color: selectedSport == item.sportId ? 'white' : '#333'}]}>{item.sportName}</Text>
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

    const _renderPlayer = memo(({item, isFriendPlayer = false}: { item: Player, isFriendPlayer?: boolean }) => {
        const hasTeams = playerTeamStatus[item.id] ?? false;
        const showBanner = isFriendPlayer && !hasTeams;
        
        return (
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
                {showBanner && (
                    <View style={styles.unassignedBanner}>
                        <Text style={styles.unassignedBannerText}>Not on a team</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    });

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
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={_handleOnOpenSearch}>
                                <Feather name="search" size={30} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerCenter}>
                            <ReactNative.Image style={styles.logoContainer}
                                               source={require('../../assets/images/logoBall.png')}/>
                        </View>
                        <View style={styles.sideHiderContainer}>
                            <TouchableOpacity
                                onPress={_onOpenNotification}
                                style={{marginRight: 5}}>
                                <Fontisto name={newNotif ? "bell-alt" : "bell"} size={30}
                                          color={newNotif ? "red" : "white"}/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onOpenChat}>
                                <Ionicons name="chatbubble-ellipses-outline" size={30} color="white"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/*{userData.role == UserType[UserType.PARENT] && (
                        <View style={{alignItems: 'center', marginTop: -15, marginBottom: 10}}>
                            <TouchableOpacity
                                onPress={_handleOpenInviteChild}
                                style={{borderColor: 'white', borderWidth: 0.5, borderRadius: 5}}>
                                <Text style={{
                                    color: 'white',
                                    textAlign: 'center',
                                    fontSize: 16,
                                    paddingVertical: 5,
                                    paddingHorizontal: 15
                                }}>
                                    Invite Child
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}*/}
                    <View style={{
                        marginTop: 5,
                        marginHorizontal: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 18
                        }}>Welcome Back, {`${Helpers.capitalize(userData?.firstName)}`} </Text>
                        {/*{userData.role == UserType[UserType.PARENT] &&
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
                        }*/}
                    </View>
                    <View style={styles.mainContainer}>
                        <View style={{marginBottom: 10, flexDirection: 'row', justifyContent: 'center'}}>
                            <TouchableOpacity
                                onPress={() => _onSearch(UserType.COACH)}
                                style={styles.tag}>
                                <Text style={styles.tagText}>Add Coach</Text>
                            </TouchableOpacity>
                            {userData?.role == UserType[UserType.PARENT] && (
                                <TouchableOpacity
                                    onPress={_handleOpenInviteChild}
                                    style={styles.tag}>
                                    <Text style={styles.tagText}>Invite Child</Text>
                                </TouchableOpacity>
                            )}
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
                            {/* {isCoach() && <TouchableOpacity
                                onPress={_onAddTeam} style={styles.tag}>
                                <Text style={styles.tagText}>Add Team</Text>
                            </TouchableOpacity>} */}
                            <TouchableOpacity onPress={_onOpenMap} style={styles.tag}>
                                <Text style={styles.tagText}>Map View</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={{flex: 1}}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            showsVerticalScrollIndicator={true}>
                            {userData?.role == UserType[UserType.PARENT] && (
                                <View style={styles.dropdownContainer}>
                                    <Text style={styles.dropdownLabel}>Select Profile:</Text>
                                    <View style={styles.dropdownWrapper}>
                                        <RNPickerSelect
                                            useNativeAndroidPickerStyle={false}
                                            placeholder={{
                                                label: 'Me',
                                                value: null,
                                                color: '#9EA0A4',
                                            }}
                                            items={userData?.children?.map(child => ({
                                                label: child.fullName,
                                                value: child.id,
                                                id: child.id,
                                                color: '#9EA0A4',
                                            })) || []}
                                            onValueChange={(value, index) => {
                                                if (value === null) {
                                                    setTempSelectedProfileId('');
                                                } else {
                                                    setTempSelectedProfileId(value);
                                                }
                                                if (Platform.OS != 'ios') {
                                                    setSelectedProfileId(value === null ? '' : value);
                                                }
                                            }}
                                            onDonePress={() => {
                                                setSelectedProfileId(tempSelectedProfileId);
                                            }}
                                            onClose={() => {
                                                setTempSelectedProfileId(selectedProfileId);
                                            }}
                                            style={pickerSelectStyles}
                                            Icon={() => (
                                                <Ionicons
                                                    name="chevron-down"
                                                    size={20}
                                                    color="#666"
                                                    style={{position: 'absolute', top: '50%', marginTop: 5, right: 10}}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                            )}
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
                                {/* Banner Ad below Your Sports */}
                                <View style={styles.adWrapper}>
                                    <BannerAdComponent />
                                </View>
                            </View>
                            {isOrganization() && <View style={styles.menuContainer}>
                                <View style={styles.menuTitleContainer}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={styles.menuTitle}>
                                            {selectedSport ? 
                                                `${selectedProfile?.sports?.find(s => s.sportId === selectedSport)?.sportName || 'Filtered'} Coaches` : 
                                                'Your Coaches'
                                            } <Text
                                            style={styles.count}>{selectedProfile?.coaches?.length || 0}</Text></Text>
                                        {selectedSport && (
                                            <TouchableOpacity
                                                onPress={_resetSelectedSport}
                                                style={[styles.btnContainer, {marginLeft: 10}]}>
                                                <Text style={styles.btnText}>Clear Filter</Text>
                                            </TouchableOpacity>
                                        )}
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
                            {((!isOrganization()) || (isOrganization() && ((selectedProfile?.teams?.length ?? 0) > 0 || selectedCoach || !selectedSport))) &&
                                <View style={styles.menuContainer}>
                                    <View style={styles.menuTitleContainer}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={styles.menuTitle}>
                                                {selectedCoach ? 
                                                    `${selectedCoach.firstName} ${selectedCoach.lastName}'s Teams` :
                                                    selectedSport ? 
                                                        `${selectedProfile?.sports?.find(s => s.sportId === selectedSport)?.sportName || 'Filtered'} Teams` : 
                                                        'Your Teams'
                                                } <Text
                                                style={styles.count}>{selectedProfile.teams?.length || 0}</Text></Text>
                                            {(selectedSport || selectedCoach) && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (selectedCoach) {
                                                            _resetSelectedCoach();
                                                            // Reload teams for organization
                                                            const organizationId = isOrganization() ? userData.id : undefined;
                                                            TeamService.getUserTeams(
                                                                selectedProfileId || userData?.id, 
                                                                selectedSport, 
                                                                organizationId
                                                            ).then(result => {
                                                                setSelectedProfile(prev => ({...prev, teams: result || []}));
                                                                if (result && result.length > 0) {
                                                                    _getAllPlayerOfSelectedTeam(undefined);
                                                                }
                                                            });
                                                        } else {
                                                            _resetSelectedSport();
                                                        }
                                                    }}
                                                    style={[styles.btnContainer, {marginLeft: 10}]}>
                                                    <Text style={styles.btnText}>Clear Filter</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <View style={{flexDirection: 'row', gap: 8}}>
                                            {selectedTeam && isCoach() && (
                                                <TouchableOpacity
                                                    onPress={() => router.push({
                                                        pathname: '/(team)/TeamForm',
                                                        params: { teamId: selectedTeam.id }
                                                    })}
                                                    style={styles.btnContainer}>
                                                    <Text style={styles.btnText}>Edit Team</Text>
                                                    <AntDesign name="edit" size={18} color="#4361EE"/>
                                                </TouchableOpacity>
                                            )}
                                            {isCoach() && <TouchableOpacity
                                                onPress={_onAddTeam}
                                                style={styles.btnContainer}>
                                                <Text style={styles.btnText}>Add Team</Text>
                                                <AntDesign name="right" size={20} color="#4361EE"/>
                                            </TouchableOpacity>}
                                        </View>
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
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={styles.menuTitle}>
                                            {selectedTeam ? 
                                                `${selectedTeam.name} Players` :
                                                selectedCoach ? 
                                                    `${selectedCoach.firstName} ${selectedCoach.lastName}'s Players` :
                                                    selectedSport ? 
                                                        `${selectedProfile?.sports?.find(s => s.sportId === selectedSport)?.sportName || 'Filtered'} Players` :
                                                        isCoach() && friendPlayers.length > 0 ? 
                                                            'Friend Players' : 
                                                            (isCoach() ? 'Your ' : '') + 'Players'
                                            } <Text
                                            style={styles.count}>
                                                {selectedTeam ? 
                                                    players?.length : 
                                                    (isCoach() && friendPlayers.length > 0 ? 
                                                        friendPlayers.length : 
                                                        players?.length)
                                                }
                                            </Text>
                                        </Text>
                                        {(selectedTeam || selectedCoach || selectedSport) && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (selectedTeam) {
                                                        setSelectedTeam(undefined);
                                                        _getAllPlayerOfSelectedTeam(undefined);
                                                    } else if (selectedCoach) {
                                                        _resetSelectedCoach();
                                                        const organizationId = isOrganization() ? userData.id : undefined;
                                                        TeamService.getUserTeams(
                                                            selectedProfileId || userData?.id, 
                                                            selectedSport, 
                                                            organizationId
                                                        ).then(result => {
                                                            setSelectedProfile(prev => ({...prev, teams: result || []}));
                                                            if (result && result.length > 0) {
                                                                _getAllPlayerOfSelectedTeam(undefined);
                                                            }
                                                        });
                                                    } else {
                                                        _resetSelectedSport();
                                                    }
                                                }}
                                                style={[styles.btnContainer, {marginLeft: 10}]}>
                                                <Text style={styles.btnText}>Clear Filter</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {isCoach() && !playersLoading && !friendPlayersLoading && <TouchableOpacity
                                        onPress={_onAddPlayer}
                                        style={styles.btnContainer}>
                                        <Text style={styles.btnText}>Add Player</Text>
                                        <AntDesign name="right" size={20} color="#4361EE"/>
                                    </TouchableOpacity>}
                                </View>
                                {(playersLoading || friendPlayersLoading) ? (
                                        <ActivityIndicator animating={true} color={MD2Colors.blueA700} size={35}/>) :
                                    (<FlatList
                                        data={selectedTeam ? 
                                            players : 
                                            (isCoach() && friendPlayers.length > 0 ? 
                                                friendPlayers : 
                                                players)
                                        }
                                        renderItem={({item}) => <_renderPlayer 
                                            item={item} 
                                            isFriendPlayer={!selectedTeam && isCoach() && friendPlayers.some(fp => fp.id === item.id)}
                                        />}
                                        keyExtractor={item => item.id}
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                        focusable={true}
                                        nestedScrollEnabled={true}
                                    />)}
                            </View>}

                            <View style={[styles.menuContainer, {marginBottom: 20}]}>
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
        paddingVertical: 10,
        height: 110,
        position: 'relative',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
        width: 60,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideHiderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: 60,
    },
    logoContainer: {
        height: 110,
        width: 240,
        resizeMode: 'contain',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopEndRadius: 35,
        borderTopStartRadius: 35,
        paddingTop: 30,
        padding: 20,
        marginTop: 20,
        width: wp(100),
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    tag: {
        backgroundColor: 'white',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    selectedTag: {
        backgroundColor: '#2757CB',
        borderColor: '#2757CB',
    },
    menuTitleContainer: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    menuTitle: {
        fontWeight: '800',
        fontSize: 20,
        color: '#1A1A1A',
    },
    count: {
        fontWeight: "600",
        fontSize: 18,
        color: '#666',
        marginLeft: 5,
    },
    btnText: {
        color: '#2757CB',
        fontSize: 16,
        fontWeight: '600',
    },
    btnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
    },
    menuContainer: {
        marginTop: 5,
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        margin: 8,
        width: 120,
        height: 160,
    },
    cardImage: {
        height: 70,
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 10,
    },
    circle: {
        borderWidth: 1,
        borderColor: '#E9EDF9',
        marginHorizontal: 8,
        height: 70,
        width: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconImage: {
        height: '65%',
        width: '65%',
        resizeMode: 'contain',
    },
    categoryContainer: {
        backgroundColor: '#F8F9FA',
        width: 160,
        height: 90,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    dropdownLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginRight: 10,
    },
    dropdownWrapper: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 20,
        // backgroundColor: 'white',
        flex: 1,
    },
    adWrapper: {
        width: '100%',
        paddingBottom: 20,
        marginTop: 10,
        backgroundColor: 'transparent',
    },
    unassignedBanner: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'center',
    },
    unassignedBannerText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        color: '#1A1A1A',
        fontWeight: '600',
        fontSize: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingRight: 30,
    },
    inputAndroid: {
        color: '#1A1A1A',
        fontWeight: '600',
        fontSize: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingRight: 30,
    },
    placeholder: {
        color: '#9EA0A4',
    },
    iconContainer: {
        top: 8,
        right: 8,
    },
});

export default Home;