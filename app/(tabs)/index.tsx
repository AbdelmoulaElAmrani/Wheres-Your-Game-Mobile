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
import {AntDesign, Fontisto, MaterialIcons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Helpers} from "@/constants/Helpers";
import {Player} from "@/models/Player";
import {Avatar} from "react-native-paper";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {getUserProfile, getUserSports} from "@/redux/UserSlice";
import UserType from "@/models/UserType";
import {Team} from "@/models/Team";

const Home = () => {
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const loading = useSelector((state: any) => state.user.loading) as boolean;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const dispatch = useDispatch();
    const tags = ['Add Coach', 'Add Player', 'Add Team', 'Map View'];
    const [selectedTag, setSelectedTag] = useState('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {

        if (!userData?.id) {
            dispatch(getUserProfile() as any);
        }
        if (userData?.id && !userSport) {
            dispatch(getUserSports(userData.id) as any);
        }
    }, [userData]);


    const _handleOnOpenMenu = () => {
        console.log('menu');
    }
    const _handleNotification = () => {
        console.log('notification');
    }

    const _onSearch = () => {
        console.log('search');
    }

    const _onSelectMenuItem = (item: string) => {
        setSelectedTag(item)
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

    const isCoach = (): boolean => userData.role == UserType.COACH.toString();


    const _renderMenuItem = memo(({item}: { item: any }) => (
        <TouchableOpacity
            style={[styles.tag, selectedTag === item ? styles.selectedTag : null]}
            onPress={() => _onSelectMenuItem(item)}
        >
            <Text style={[styles.tagText, {color: selectedTag === item ? 'white' : 'black'}]}>{item}</Text>
        </TouchableOpacity>
    ));

    const _renderSportItem = memo(({item}: { item: UserSportResponse }) => {
        const [iconLoadedError, setIconLoadedError] = useState(false);

        const iconSource = useMemo(() => {
            if (iconLoadedError || !item.iconUrl) {
                return require('../../assets/images/sport/sport.png');
            } else {
                try {
                    return {uri: `../../assets/images/sport/${item.iconUrl}.png`};
                } catch {
                    setIconLoadedError(true);
                    return require('../../assets/images/sport/sport.png');
                }
            }
        }, [item.iconUrl, iconLoadedError]);

        return (<TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}
            onPress={() => _onSelectMenuItem(item.id)}
        >
            <View style={styles.circle}>
                <Image
                    source={iconSource} style={styles.iconImage}/>
            </View>
            <Text style={styles.tagText}>{item.sportName}</Text>
        </TouchableOpacity>);
    });

    const _renderTeam = memo(({item}: { item: string }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => _onSelectMenuItem(item)}
        >
            <View>
                <View style={styles.cardImage}>
                    {false ? (
                        <Avatar.Image size={60} source={{uri: item}}/>
                    ) : (
                        <Avatar.Text
                            size={60}
                            label={(item.charAt(0) + item.charAt(1)).toUpperCase()}
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
            onPress={() => _onSelectMenuItem(item)}
        >
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
            style={[styles.tag, selectedTag === item ? styles.selectedTag : null]}
            onPress={() => _onSelectMenuItem(item)}
        >
            <Text style={[styles.tagText, {color: selectedTag === item ? 'white' : 'black'}]}>{item}</Text>
        </TouchableOpacity>
    ));

    const User = UserType;
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
                                onPress={_handleNotification}
                                style={{marginRight: 20}}>
                                <Fontisto name="bell" size={30} color="white"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onSearch}
                            >
                                <AntDesign name="search1" size={30} color="white"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{marginTop: 35, marginHorizontal: 20, flexDirection: 'row'}}>
                        <Text style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 18
                        }}>Hi {`${Helpers.capitalize(userData?.firstName)}`}</Text>
                        <View>

                        </View>
                    </View>
                    <View style={styles.mainContainer}>
                        <View style={{marginBottom: 10}}>
                            <FlatList
                                data={tags}
                                renderItem={({item}) => <_renderMenuItem item={item}/>}
                                keyExtractor={item => item}
                                horizontal={true}
                                showsHorizontalScrollIndicator={true}
                                focusable={true}
                            />
                        </View>
                        <ScrollView
                            style={{flex: 1}}
                            showsVerticalScrollIndicator={true}
                        >
                            <View style={styles.menuContainer}>
                                <View style={styles.menuTitleContainer}>
                                    <Text style={styles.menuTitle}>Your Sports <Text
                                        style={styles.count}>{userSport?.length}</Text></Text>
                                </View>
                                <FlatList
                                    data={userSport}
                                    renderItem={({item}) => <_renderSportItem item={item}/>}
                                    keyExtractor={item => item.sportId}
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
                                    data={tags}
                                    renderItem={({item}) => <_renderTeam item={item}/>}
                                    keyExtractor={item => item}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={true}
                                    focusable={true}
                                    nestedScrollEnabled={true}
                                />
                            </View>

                            <View style={styles.menuContainer}>
                                <View style={styles.menuTitleContainer}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.menuTitle}>Your Players <Text
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
                            </View>

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
        paddingHorizontal: 8,
        paddingVertical: 5,
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
        marginHorizontal: 4,
        height: 80,
        width: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconImage: {
        height: '70%',
        width: '70%',
        //resizeMode: 'cover',
    },
});


export default Home;