import {
    FlatList,
    Image,
    ImageBackground,
    Keyboard, ScrollView,
    StyleSheet, Text, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {memo, useState} from "react";
import {AntDesign, Fontisto, MaterialIcons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Helpers} from "@/constants/Helpers";
import {Player} from "@/models/Player";

const Home = () => {
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const tags = ['Add Coach', 'Add Player', 'Add Team', 'Map View'];
    const [selectedTag, setSelectedTag] = useState('');
    const [players, setPlayers] = useState<Player[]>([]);


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


    const _renderMenuItem = memo(({item}: { item: any }) => (
        <TouchableOpacity
            style={[styles.tag, selectedTag === item ? styles.selectedTag : null]}
            onPress={() => _onSelectMenuItem(item)}
        >
            <Text style={[styles.tagText, {color: selectedTag === item ? 'white' : 'black'}]}>{item}</Text>
        </TouchableOpacity>
    ));

    const _renderSportItem = memo(({item}: { item: any }) => (
        <TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}
            onPress={() => _onSelectMenuItem(item)}
        >
            <View style={styles.circle}>
                <Text style={styles.tagText}>{item}</Text>
            </View>
            <Text style={styles.tagText}>{item}</Text>
        </TouchableOpacity>
    ));

    const _renderTeam = memo(({item}: { item: any }) => (
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
                                        style={styles.count}>8</Text></Text>
                                </View>
                                <FlatList
                                    data={tags}
                                    renderItem={({item}) => <_renderSportItem item={item}/>}
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
                                        <Text style={styles.menuTitle}>Your Teams <Text
                                            style={styles.count}>8</Text></Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={_onAddTeam}
                                        style={styles.btnContainer}>
                                        <Text style={styles.btnText}>Add Team</Text>
                                        <AntDesign name="right" size={20} color="#4361EE"/>
                                    </TouchableOpacity>
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
                                            style={styles.count}>8</Text></Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={_onAddPlayer}
                                        style={styles.btnContainer}>
                                        <Text style={styles.btnText}>Add Player</Text>
                                        <AntDesign name="right" size={20} color="#4361EE"/>
                                    </TouchableOpacity>
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

                            <View style={styles.menuContainer}>
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
        shadowOffset: {width: 10, height: 10},
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
        margin: 6
    },
    cardImage: {
        height: 65,
        width: 85
    },
    circle: {
        borderWidth: 1,
        borderColor: 'black',
        marginHorizontal: 4,
        height: 80,
        width: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
});


export default Home;