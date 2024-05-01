import {
    FlatList,
    ScrollView,
    StyleSheet, Text, TouchableOpacity,
    View,
    Image,
    ImageBackground
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {memo, useEffect, useMemo, useState} from "react";
import {AntDesign, Fontisto, Ionicons, MaterialIcons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Helpers} from "@/constants/Helpers";
import {Player} from "@/models/Player";
import {Avatar} from "react-native-paper";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {getUserProfile, getUserSports} from "@/redux/UserSlice";
import UserType from "@/models/UserType";
import {Team} from "@/models/Team";
import {router} from "expo-router";
import RNPickerSelect from 'react-native-picker-select';
import {TeamService} from "@/services/TeamService";
import {StorageService} from "@/services/StorageService";

const categories = ['Sports Category', 'Sports Training', 'Multimedia Sharing', 'Educational Resources', 'Account', 'Advertising', 'Analytics', 'Virtual Events', 'Augmented Reality (AR)'];

const Home = () => {
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const loading = useSelector((state: any) => state.user.loading) as boolean;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const dispatch = useDispatch();
    const tags = ['Add Coach', 'Add Player', 'Add Team', 'Map View'];
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
    const [selectedChild, setSelectedChild] = useState<Player | undefined>(undefined)
    const [children, setChildren] = useState<Player[]>([])
    const childrens = [
        {
            label: 'All Children',
            value: 'All Children',
        },
        {
            label: 'Child 1',
            value: 'Child 1',
        },
        {
            label: 'Child 2',
            value: 'Child 2',
        },
    ];

    useEffect(() => {
        if (!userData?.id) {
            dispatch(getUserProfile() as any);
        }
        const fetchData = async () => {
            if (userData?.id) {
                try {
                    dispatch(getUserSports(userData.id) as any);
                    //await _getMyTeams();
                } catch (e) {
                }
            }
        }
        fetchData();
    }, [userData]);


    const _getMyTeams = async () => {
        try {
            const result = await TeamService.getUserTeams(userData.id);
            console.log('teams', result);
            setTeams(result);
        } catch (e) {
            console.log('_getMyTeams', e);
        }
    }

    const _getAllPlayerOfSelectedTeam = async () => {
        try {
            if (selectedTeam?.id) {
                const teamPlayers = await TeamService.getTeamPlayers(selectedTeam.id);
                console.log('players', teamPlayers);
                setPlayers(teamPlayers);
            }
        } catch (e) {
            console.log('_getAllPlayerOfSelectedTeam', e);
        }
    }


    const _handleOnOpenMenu = () => {
        console.log('menu');
    }
    const _onOpenNotification = () => {
        router.navigate('/(user)/Notifications');
    }

    const _onOpenChat = () => {
        router.navigate('/(user)/Chats');
    }

    const _onOpenMap = () => {
        router.navigate('/(map)');
    }

    const _onAddPlayer = () => {
        console.log('Add Player');
    }

    const _onAddTeam = () => {
        console.log('Add Team');
    }

    const _onViewAll = () => {
        console.log('View All');
    }

    const _onSelectTeam = async (team: Team) => {
        console.log('selected team');
        try {
            setSelectedTeam(team);
            await _getAllPlayerOfSelectedTeam();
        } catch (e) {

        }
    }
    const _onSelectPlayer = (player: any) => {
        console.log('Player');
    }

    const _onSelectCategory = (category: any) => {
        console.log('Category')
    }

    const _onSelectSport = (id: any) => {
        console.log('select sport');
    }

    const isCoach = (): boolean => userData.role == UserType[UserType.COACH];

    const isPlayersVisible = (): boolean =>
        (isCoach() || UserType[UserType.PLAYER] == userData.role.toString()) && selectedTeam !== undefined;


    const _renderSportItem = memo(({item}: { item: UserSportResponse }) => {
        const [iconSource, setIconSource] = useState<any>(null);

        useEffect(() => {
            const fetchIconSource = async () => {
                try {
                    let source;
                    if (!item.iconUrl) {
                        source = require('../../assets/images/sport/sport.png');
                    } else {
                        const data = await StorageService.downloadImageByName(item.iconUrl, true);
                        if (data?.image) {
                            source = {uri: Helpers.getImageSource(data.image)};
                        } else {
                            source = require('../../assets/images/sport/sport.png');
                        }
                    }
                    setIconSource(source);
                } catch (error) {
                    setIconSource(require('../../assets/images/sport/sport.png'));
                }
            };
            fetchIconSource();
        }, [item.iconUrl]);

        return (<TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}
            onPress={() => _onSelectSport(item.id)}>
            <View style={styles.circle}>
                <Image
                    source={iconSource} style={styles.iconImage}/>
            </View>
            <Text style={styles.tagText}>{item.sportName}</Text>
        </TouchableOpacity>);
    });

    const _renderTeam = memo(({item}: { item: Team }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => _onSelectTeam(item)}>
            <View>
                <View style={styles.cardImage}>
                    {item.imageUrl ? (
                        <Avatar.Image size={60} source={{uri: item.imageUrl}}/>
                    ) : (
                        <Avatar.Text
                            size={60}
                            label={(item.name.charAt(0) + item.name.charAt(1)).toUpperCase()}
                        />
                    )}
                </View>
            </View>
            <Text>item</Text>
        </TouchableOpacity>
    ));

    const _renderPlayer = memo(({item}: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => _onSelectPlayer(item)}>
            <View>
                <Image
                    style={styles.cardImage}
                    source={require('../../assets/images/flags/US-flag.png')}/>
            </View>
            <Text>item</Text>
        </TouchableOpacity>
    ));

    const _renderCategory = memo(({item}: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryContainer}
            onPress={() => _onSelectCategory(item)}>
            <Text style={{fontSize: 14, fontWeight: 'bold', textAlign: 'center'}}>{item}</Text>
        </TouchableOpacity>
    ));

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
                    <View style={styles.headerContainer}>
                        <View>
                            <TouchableOpacity onPress={_handleOnOpenMenu}>
                                <MaterialIcons name="menu" size={35} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginLeft: 20}}>
                            <Image style={styles.logoContainer}
                                   source={require('../../assets/images/homeLogo.png')}/>
                        </View>
                        <View style={styles.sideHiderContainer}>
                            <TouchableOpacity
                                onPress={_onOpenNotification}
                                style={{marginRight: 20}}>
                                <Fontisto name="bell" size={30} color="white"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onOpenChat}
                            >
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
                        {userData.role == UserType[UserType.PARENT] && <RNPickerSelect
                            placeholder={{}}
                            items={childrens}
                            onValueChange={value => {
                                console.log(value)
                            }}
                            style={pickerSelectStyles}
                            value={selectedChild}
                        />}
                    </View>
                    <View style={styles.mainContainer}>
                        <View style={{marginBottom: 10, flexDirection: 'row', justifyContent: 'center'}}>
                            <TouchableOpacity style={styles.tag}>
                                <Text style={styles.tagText}>Add Coach</Text>
                            </TouchableOpacity>
                            {isCoach() && <TouchableOpacity onPress={_onAddPlayer} style={styles.tag}>
                                <Text style={styles.tagText}>Add Player</Text>
                            </TouchableOpacity>}
                            {isCoach() && <TouchableOpacity onPress={_onAddTeam} style={styles.tag}>
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
                                            style={styles.count}>{players?.length}</Text></Text>
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
                                    {isCoach() && <TouchableOpacity
                                        onPress={_onAddPlayer}
                                        style={styles.btnContainer}>
                                        <Text style={styles.btnText}>Add Player</Text>
                                        <AntDesign name="right" size={20} color="#4361EE"/>
                                    </TouchableOpacity>}
                                </View>
                                <FlatList
                                    data={tags}
                                    renderItem={({item}) => <_renderPlayer item={item}/>}
                                    keyExtractor={item => item}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={true}
                                    focusable={true}
                                    nestedScrollEnabled={true}
                                />
                            </View>}

                            <View style={[styles.menuContainer, {marginBottom: 100}]}>
                                <View style={styles.menuTitleContainer}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.menuTitle}>Explore by Categories</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={_onViewAll}
                                        style={styles.btnContainer}>
                                        <Text style={styles.btnText}>View All</Text>
                                        <AntDesign name="right" size={20} color="#4361EE"/>
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
        backgroundColor: '#295AD2',
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
        backgroundColor: 'white',
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
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 4,
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
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 4,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        width: 120,
        paddingHorizontal: 10,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default Home;