import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import Spinner from "@/components/Spinner";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import React, {useEffect, useState} from "react";
import {router} from "expo-router";
import {useRoute} from "@react-navigation/core";
import {Avatar, Divider} from "react-native-paper";
import TeamSearchCard from "@/components/Search/TeamSearchCard";
import PersonSearchCard from "@/components/Search/PersonSearchCard";
import {TeamService} from "@/services/TeamService";
import {Team} from "@/models/Team";

enum tabOption {
    Team,
    Event,
    Status
}

const TeamProfile = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [team, setTeam] = useState<Team | undefined>(undefined);
    const [selectOption, setSelectOption] = useState<tabOption>(tabOption.Team);
    const route = useRoute();
    const paramData = route.params as any;

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    useEffect(() => {
        //TODO:: call the service to get team profile from the back end
        const fetchTeamById = async () => {
            setLoading(true);
            const data = await TeamService.getTeamById(paramData.teamId);
            setTeam(data);
            setLoading(false);
        }
        fetchTeamById();
    }, [paramData.teamId]);

    const handleSelect = (option: tabOption) => {
        setSelectOption(option);
    };

    return (
        <ImageBackground
            style={{
                flex: 1,
                width: '100%',
            }}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                {loading && (
                    <Spinner visible={loading}/>
                )}
                <CustomNavigationHeader text={`Team Profile`}
                                        goBackFunction={_handleGoBack} showBackArrow/>
                <View style={styles.mainContainer}>
                    <View style={styles.cardContainer}>
                        <View style={styles.headerContainer}>
                            <View style={styles.imageContainer}>
                                {team?.imgUrl ? (
                                    <Image
                                        style={styles.image}
                                        source={{uri: team.imgUrl}}
                                    />
                                ) : (
                                    <Avatar.Text
                                        size={wp(15)}
                                        label={(() => {
                                            if (!team?.name) return ''; // Return an empty label if team or team.name is null

                                            const nameParts = team.name.trim().split(' ').filter(Boolean);
                                            if (nameParts.length >= 2) {
                                                // Take the first character of each part and combine them
                                                return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
                                            } else {
                                                // If there is only one word, take the first two characters
                                                return (team.name.charAt(0) + team.name.charAt(1)).toUpperCase();
                                            }
                                        })()}
                                    />
                                )}
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.teamName}>{team?.name}</Text>
                                <Text style={styles.teamLocation}>
                                    {team?.address ? team.address : ""}{team?.address && team?.country ? ", " : ""}{team?.country ? team.country : ""}
                                </Text>
                            </View>
                        </View>
                        <Divider bold={true} style={{width: '100%'}}/>
                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoTitle}>Manager</Text>
                                <Text style={styles.infoValue}>{team?.coach}</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoTitle}>League</Text>
                                <Text style={styles.infoValue}>Phil Park</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoTitle}>Founded</Text>
                                <Text style={styles.infoValue}>{team?.founded ? new Date(team.founded).getFullYear() : 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{width: '90%'}}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            width: '100%',
                            marginBottom: 1,
                        }}>
                            <TouchableOpacity
                                onPress={() => handleSelect(tabOption.Team)}>
                                <Text
                                    style={[styles.tabText, selectOption === tabOption.Team && styles.selectedText]}>
                                    Team
                                </Text>
                                {selectOption === tabOption.Team && <View style={styles.underline}/>}
                            </TouchableOpacity>
                        </View>
                        <Divider bold={true} style={{width: '100%'}}/>
                    </View>
                    <View style={{width: '90%'}}>
                        <Text style={{fontWeight: 'bold', marginTop: 10, fontSize: 16}}>Team List</Text>
                        <View style={{marginTop: hp('2%'), height: '75%'}}>
                            <FlatList
                                contentContainerStyle={{
                                    width: '100%',
                                    alignSelf: 'center',
                                    paddingBottom: hp('10%'),
                                }}
                                data={team?.members}
                                ListFooterComponent={<View
                                    style={{height: hp('10%')}}/>}  // Extra space at the bottom
                                renderItem={({item}) => <PersonSearchCard player={item}/>}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </View>
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
        borderTopRightRadius: wp('5%'),
        borderTopLeftRadius: wp('5%'),
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        marginBottom: hp('1%'),
    },
    teamName: {
        fontWeight: 'bold',
        fontSize: wp('5%'), // Adjusted for better readability on different screens
        color: '#000',
    },
    teamLocation: {
        fontSize: wp('3.5%'),
        color: '#7d7d7d',
        marginTop: 5
    },
    imageContainer: {
        marginRight: wp('5%'),
        padding: wp('0.5%'),
    },
    image: {
        width: wp('15%'),
        height: wp('15%'),
        borderRadius: 3,
        resizeMode: 'cover',
    },
    cardContainer: {
        borderWidth: 1,
        padding: wp('5%'),
        borderColor: '#d3d3d3',
        borderRadius: 10,
        width: '90%',
        backgroundColor: '#fff',
        marginBottom: hp('2%'),
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginTop: hp('3%'),
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp('2%'),
    },
    infoColumn: {
        alignItems: 'center',
    },
    infoTitle: {
        fontWeight: 'bold',
        fontSize: wp('4%'),
    },
    infoValue: {
        color: 'blue',
        fontSize: wp('3.5%'),
        marginTop: 4
    },
    selectedText: {
        color: 'blue',
        fontWeight: 'bold',
    },
    underline: {
        height: 2,
        backgroundColor: 'blue',
        marginTop: 5,
    },
    tabText: {
        fontSize: 18,
        color: 'grey',
        marginBottom: 5
    }
});

export default TeamProfile;
