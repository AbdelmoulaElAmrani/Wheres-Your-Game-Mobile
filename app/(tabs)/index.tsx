import ReactNative, {FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {memo, useEffect, useState} from "react";
import {AntDesign, Feather, Fontisto, Ionicons, MaterialIcons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Helpers} from "@/constants/Helpers";
import {Player} from "@/models/Player";
import {ActivityIndicator, Avatar, MD2Colors} from "react-native-paper";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {getUserProfile, getUserSports} from "@/redux/UserSlice";
import UserType from "@/models/UserType";
import {Team} from "@/models/Team";
import {router, useRouter} from "expo-router";
import RNPickerSelect from 'react-native-picker-select';
import {TeamService} from "@/services/TeamService";
import Spinner from "@/components/Spinner";
import {Image, ImageBackground} from "expo-image";
import {NotificationService} from "@/services/NotificationService";
import {NOTIFICATION_REFRESH_TIMER} from "@/appConfig";
import {useIsFocused} from "@react-navigation/native";

const categories = ['Sports Category', 'Sports Training', 'Multimedia Sharing', 'Educational Resources', 'Account', 'Advertising', 'Analytics', 'Virtual Events', 'Augmented Reality (AR)'];
const REFRESH_NOTIFICATION_TIME = NOTIFICATION_REFRESH_TIMER * 1000;
const Home = () => {
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const loading = useSelector((state: any) => state.user.loading) as boolean;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const dispatch = useDispatch();
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[] | undefined>(undefined);
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
    const [selectedChild, setSelectedChild] = useState<Player | undefined>(undefined)
    //const [children, setChildren] = useState<Player[]>([])
    const [playersLoading, setPlayersLoading] = useState<boolean>(false)
    const _router = useRouter();
    const [newNotif, setNewNotif] = useState<boolean>(false);
    const [childrens, setChildrens] = useState<any[]>(
        [
            {
                label: 'All Children',
                value: 'All Children',
                id: ''
            },
            {
                label: 'Child 1',
                value: 'Child 1',
                id: ''
            },
            {
                label: 'Child 2',
                value: 'Child 2',
                id: ''
            },
        ]
    );
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isFocused) {
            if (userData == undefined || userData.id == undefined) {
                dispatch(getUserProfile() as any);
            }
            const fetchData = async () => {
                try {
                    if (userData?.id) {
                        if (userSport.length == 0) {
                            setIsLoading(true);
                            dispatch(getUserSports(userData.id) as any);
                        }
                        if (!teams) {
                            setIsLoading(true);
                            await _getMyTeams();
                        }
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            }

            fetchData();
            checkForNotification();
            const intervalId = setInterval(checkForNotification, REFRESH_NOTIFICATION_TIME);

            return () => clearInterval(intervalId);
        } else {
            setPlayers([]);
            setSelectedTeam(undefined);
        }
    }, [isFocused, userData]);


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

    const _getMyTeams = async () => {
        try {
            const result = await TeamService.getUserTeams(userData.id);
            setTeams(result);
        } catch (e) {
            console.error('_getMyTeams', e);
        }
    }

    const _getAllPlayerOfSelectedTeam = async (team?: Team | undefined) => {
        try {
            const id = selectedTeam?.id ? selectedTeam.id : team?.id ? team.id : undefined;
            if (id) {
                setPlayersLoading(true);
                const teamPlayers = await TeamService.getTeamPlayers(id);
                setPlayers(old => {
                    setPlayersLoading(false);
                    return teamPlayers;
                });
            }
        } catch (e) {
            console.error('_getAllPlayerOfSelectedTeam', e);
        } finally {
            setPlayersLoading(false);
        }
    }


    const _handleOnOpenSearch = () => {
        router.navigate('(user)/SearchGlobal');
    }
    const _onOpenNotification = () => {
        setNewNotif(false);
        router.navigate('/(user)/Notifications');
    }

    const _onOpenChat = () => {
        router.navigate('/(user)/Chats');
    }

    const _onOpenMap = () => {
        router.navigate('/(map)');
    }

    const _onSearch = (searchType: UserType) => {
        _router.push({
            pathname: '/(user)/SearchUser',
            params: {searchType: UserType[searchType]},
        });
    }

    const _onAddPlayer = () => {
    }

    const _onAddTeam = () => {
        router.navigate('TeamForm');
    }

    const _onViewAll = () => {
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
    const _onSelectPlayer = (player: any) => {
    }

    const _onSelectCategory = (category: any) => {
    }

    const _onSelectSport = (id: any) => {
    }

    const isCoach = (): boolean => userData.role == UserType[UserType.COACH] || userData.role == UserType[UserType.ORGANIZATION];

    const isPlayersVisible = (): boolean =>
        (isCoach() || UserType[UserType.PLAYER] == userData.role) && selectedTeam !== undefined;


    const _renderSportItem = memo(({item}: { item: UserSportResponse }) => {
        return (<TouchableOpacity
            disabled={true}
            style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}
            onPress={() => _onSelectSport(item.id)}>
            <View style={styles.circle}>
                <Image
                    placeholder={require('../../assets/images/sport/sport.png')}
                    placeholderContentFit={'contain'}
                    source={{uri: item.iconUrl}}
                    style={styles.iconImage}/>
            </View>
            <Text style={styles.tagText}>{item.sportName}</Text>
        </TouchableOpacity>);
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
            disabled={true}
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

    const _renderCategory = memo(({item}: { item: any }) => (
        <TouchableOpacity
            disabled={true}
            style={styles.categoryContainer}
            onPress={() => _onSelectCategory(item)}>
            <Text style={{fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: 'white'}}>{item}</Text>
        </TouchableOpacity>
    ));

    const _handleOpenInviteChild = () => {
        //TODO::
        _router.push({
            pathname: '/(user)/SearchUser',
            params: {searchType: UserType.DEFAULT},
        });
    }


    const getAllChildren = () => {
        //TODO:: Call Service Children and get the user children, then set it to
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

                <SafeAreaView style={{height: hp(100)}}>
                    {(loading || isLoading) && <Spinner visible={loading || isLoading}/>}
                    <View style={styles.headerContainer}>
                        <View>
                            <TouchableOpacity onPress={_handleOnOpenSearch}>
                                <Feather name="search" size={30} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginLeft: 20}}>
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
                                    placeholder={{}}
                                    items={childrens}
                                    onValueChange={(value, index) => {
                                        //TODO:: Set The Selected Child
                                        console.log(value);
                                    }}
                                    onDonePress={() => {
                                        //TODO:: Call the function to get the child data
                                        console.log('done');
                                    }}
                                    style={pickerSelectStyles}
                                    value={selectedChild}
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
                                        style={styles.count}>{userSport?.length}</Text></Text>
                                </View>
                                <FlatList
                                    data={userSport}
                                    renderItem={({item}) => <_renderSportItem item={item}/>}
                                    keyExtractor={item => item.sportId + item.sportName}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={true}
                                    focusable={true}
                                    nestedScrollEnabled={true}
                                />
                            </View>
                            <View style={styles.menuContainer}>
                                <View style={styles.menuTitleContainer}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.menuTitle}>Your Teams <Text
                                            style={styles.count}>{teams?.length}</Text></Text>
                                    </View>
                                    {isCoach() && <TouchableOpacity
                                        onPress={_onAddTeam}
                                        style={styles.btnContainer}>
                                        <Text style={styles.btnText}>Add Team</Text>
                                        <AntDesign name="right" size={20} color="#4361EE"/>
                                    </TouchableOpacity>}
                                </View>
                                <FlatList
                                    data={teams}
                                    renderItem={({item}) => <_renderTeam item={item}/>}
                                    keyExtractor={item => item.id}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={true}
                                    focusable={true}
                                    nestedScrollEnabled={true}
                                />
                            </View>

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
                                        showsHorizontalScrollIndicator={true}
                                        focusable={true}
                                        nestedScrollEnabled={true}
                                    />)}
                            </View>}

                            <View style={[styles.menuContainer, {marginBottom: 100}]}>
                                <View style={styles.menuTitleContainer}>
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
                                </View>

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
        width: 120,
        paddingHorizontal: 10,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center'
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