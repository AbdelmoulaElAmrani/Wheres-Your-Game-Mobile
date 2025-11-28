import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import Spinner from "@/components/Spinner";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useEffect, useState} from "react";
import {router, useLocalSearchParams} from "expo-router";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator} from "react-native";
import {Avatar, Divider} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {FontAwesome6} from "@expo/vector-icons";
import * as Linking from 'expo-linking';
import {UserService} from "@/services/UserService";
import {Helpers} from "@/constants/Helpers";
import {getUserProfile} from "@/redux/UserSlice";
import OverlaySpinner from "@/components/OverlaySpinner";
import {TeamService} from "@/services/TeamService";
import {Team} from "@/models/Team";
import UserType from "@/models/UserType";
import {AntDesign} from "@expo/vector-icons";
import {useAlert} from "@/utils/useAlert";
import StyledAlert from "@/components/StyledAlert";
import {Modal} from "react-native";
import {FlatList} from "react-native";


enum MenuOption {
    Overview,
    Videos,
    Sports_Profiles
}

export const UserProfile = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [followed, setFollowed] = useState<boolean>(false);
    const [person, setPerson] = useState<UserResponse | undefined>(undefined);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [selectOption, setSelectOption] = useState<MenuOption>(MenuOption.Overview);
    const dispatch = useDispatch();
    const paramData = useLocalSearchParams<any>();
    const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loadingTeams, setLoadingTeams] = useState<boolean>(false);
    const [assigning, setAssigning] = useState<boolean>(false);
    const { showErrorAlert, showSuccessAlert, showStyledAlert, alertConfig, closeAlert } = useAlert();

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    useEffect(() => {
        const fetchUserById = async () => {
            setLoading(true);
            const data = await UserService.getUserProfileById(paramData.userId);
            setPerson(data);
            setLoading(false);
        }

        fetchUserById();
    }, [paramData.userId]);

    // Load teams when modal opens (only for coaches viewing players)
    useEffect(() => {
        if (showTeamModal && currentUser?.role === UserType[UserType.COACH] && person?.role === UserType[UserType.PLAYER]) {
            _loadTeams();
        }
    }, [showTeamModal]);

    const _loadTeams = async () => {
        if (!currentUser?.id) return;
        try {
            setLoadingTeams(true);
            const userTeams = await TeamService.getUserTeams(currentUser.id);
            setTeams(userTeams || []);
        } catch (e) {
            console.error('Error loading teams:', e);
            showErrorAlert('Failed to load teams', closeAlert);
        } finally {
            setLoadingTeams(false);
        }
    };

    const _handleAssignToTeam = async (team: Team) => {
        if (!person?.id || !team.id) return;
        try {
            setAssigning(true);
            const result = await TeamService.addPlayerToTeam(team.id, person.id);
            if (result) {
                showSuccessAlert(`Player assigned to ${team.name} successfully!`, closeAlert);
                setShowTeamModal(false);
            } else {
                showErrorAlert('Failed to assign player to team', closeAlert);
            }
        } catch (e: any) {
            console.error('Error assigning player to team:', e);
            const errorMessage = e?.response?.data || e?.message || 'Failed to assign player to team';
            showErrorAlert(errorMessage, closeAlert);
        } finally {
            setAssigning(false);
        }
    };

    const isCoach = (): boolean => currentUser?.role === UserType[UserType.COACH];
    const isPlayer = (): boolean => person?.role === UserType[UserType.PLAYER];
    const showAssignButton = (): boolean => isCoach() && isPlayer();


    useEffect(() => {
        if (followed) return;
        const flow = Helpers.checkIfAlreadyFollow(currentUser.id, person?.followers)
        setFollowed(flow);
    }, [currentUser, person]);


    const _handleFollow = async () => {
        setFollowed(true);
        try {
            const response: boolean = await UserService.followUser(person?.id);
            setFollowed(response);
            dispatch(getUserProfile() as any);
        } catch (e) {
            console.error(e);
        }
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
                    <OverlaySpinner visible={loading}/>
                )}
                <CustomNavigationHeader 
                    text={person?.role || 'Profile'} 
                    goBackFunction={_handleGoBack} 
                    showBackArrow
                />
                {showAssignButton() && (
                    <View style={styles.assignButtonContainer}>
                        <TouchableOpacity
                            onPress={() => setShowTeamModal(true)}
                            style={styles.assignButton}>
                            <AntDesign name="adduser" size={20} color="white" />
                            <Text style={styles.assignButtonText}>Assign to Team</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.mainContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}
                                contentContainerStyle={{alignItems: 'center'}}
                                style={{width: '100%', flex: 1}}>
                        <View style={styles.profileImageContainer}>
                            <View style={styles.imageContainer}>
                                {person?.imageUrl ? (
                                    <Avatar.Image size={hp(20)} source={{uri: person.imageUrl}}/>
                                ) : (
                                    <Avatar.Text
                                        size={hp(20)}
                                        //@ts-ignore
                                        label={
                                            `${(person?.firstName?.charAt(0) || "")}${(person?.lastName?.charAt(0) || "")}`.toUpperCase()
                                        }
                                    />
                                )}
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    fontSize: 18
                                }}>
                                    {`${person?.firstName?.charAt(0).toUpperCase() || ''}${person?.firstName?.slice(1).toLowerCase() || ''} ${person?.lastName?.charAt(0).toUpperCase() || ''}${person?.lastName?.slice(1).toLowerCase() || ''}`}
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
                                        <Text style={styles.infoText}>{person?.preferenceSport}</Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Age</Text>
                                        <Text style={styles.infoText}>
                                            {person?.dateOfBirth ? `${Helpers.calculateAge(person.dateOfBirth)} Years` : ""}
                                        </Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Positions</Text>
                                        <Text style={styles.infoText}>{person?.positionCoached || ""}</Text>
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
                                        <Text style={styles.infoText}>{currentUser.skillLevel?.[0] ?? ""}</Text>
                                    </View>
                                    <View style={styles.infoMiniCard}>
                                        <Text style={styles.infoTitle}>Followers</Text>
                                        <Text style={styles.infoText}>{person?.followers?.length || 0}</Text>
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
                                            onPress={() => person?.socialMediaLinks?.instagramAccount && _handleOpenUrl(person?.socialMediaLinks?.instagramAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.socialMediaLinks?.instagramAccount}
                                        >
                                            <FontAwesome6
                                                name="instagram"
                                                size={40}
                                                color={person?.socialMediaLinks?.instagramAccount ? "#E4405F" : "#cccccc"}
                                                style={{opacity: person?.socialMediaLinks?.instagramAccount ? 1 : 0.5}}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => person?.socialMediaLinks?.tiktokAccount && _handleOpenUrl(person?.socialMediaLinks?.tiktokAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.socialMediaLinks?.tiktokAccount}
                                        >
                                            <FontAwesome6
                                                name="tiktok"
                                                size={40}
                                                color={person?.socialMediaLinks?.tiktokAccount ? "black" : "#cccccc"}
                                                style={{opacity: person?.socialMediaLinks?.tiktokAccount ? 1 : 0.5}}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => person?.socialMediaLinks?.facebookAccount && _handleOpenUrl(person?.socialMediaLinks?.facebookAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.socialMediaLinks?.facebookAccount}
                                        >
                                            <FontAwesome6
                                                name="facebook"
                                                size={40}
                                                color={person?.socialMediaLinks?.facebookAccount ? "blue" : "#cccccc"}
                                                style={{opacity: person?.socialMediaLinks?.facebookAccount ? 1 : 0.5}}
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
                                            onPress={() => person?.socialMediaLinks?.youtubeAccount && _handleOpenUrl(person?.socialMediaLinks?.youtubeAccount)}
                                            style={styles.iconCard}
                                            disabled={!person?.socialMediaLinks?.youtubeAccount}>
                                            <FontAwesome6
                                                name="youtube"
                                                size={40}
                                                color={person?.socialMediaLinks?.youtubeAccount ? "red" : "#cccccc"}
                                                style={{opacity: person?.socialMediaLinks?.youtubeAccount ? 1 : 0.5}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            }
                            {
                                selectOption == MenuOption.Sports_Profiles && (
                                    <View style={styles.sportsProfileContainer}>
                                        {person?.userSports && person.userSports.length > 0 ? (
                                            person.userSports.map((sport, index) => (
                                                <View key={index} style={styles.sportCard}>
                                                    <Text style={styles.sportName}>{sport.sportName}</Text>
                                                    {sport.skillLevel && (
                                                        <Text style={styles.skillLevel}>Skill Level: {sport.skillLevel}</Text>
                                                    )}
                                                    {sport.position && (
                                                        <Text style={styles.position}>Position: {sport.position}</Text>
                                                    )}
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.noSportsText}>No sports profiles available</Text>
                                        )}
                                    </View>
                                )
                            }
                            <TouchableOpacity
                                onPress={_handleFollow}
                                disabled={followed}
                                style={[styles.followBtn, followed && {backgroundColor: 'grey'}]}>
                                <Text style={{
                                    color: 'white',
                                    fontSize: 16,
                                    fontWeight: 'bold'
                                }}>{followed ? 'Following' : 'Follow'}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
                
                {/* Team Selection Modal */}
                <Modal
                    visible={showTeamModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowTeamModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Team</Text>
                                <TouchableOpacity onPress={() => setShowTeamModal(false)}>
                                    <AntDesign name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                            
                            {loadingTeams ? (
                                <View style={styles.modalLoading}>
                                    <Text>Loading teams...</Text>
                                </View>
                            ) : teams.length === 0 ? (
                                <View style={styles.modalLoading}>
                                    <Text style={styles.noTeamsText}>No teams available</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowTeamModal(false);
                                            router.push('/(team)/TeamForm');
                                        }}
                                        style={styles.createTeamButton}>
                                        <Text style={styles.createTeamButtonText}>Create Team</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <FlatList
                                    data={teams}
                                    keyExtractor={item => item.id}
                                    renderItem={({item}) => (
                                        <TouchableOpacity
                                            style={styles.teamItem}
                                            onPress={() => _handleAssignToTeam(item)}
                                            disabled={assigning}>
                                            <View style={styles.teamItemContent}>
                                                {item.imgUrl ? (
                                                    <Avatar.Image size={50} source={{uri: item.imgUrl}} />
                                                ) : (
                                                    <Avatar.Text
                                                        size={50}
                                                        label={item.name.substring(0, 2).toUpperCase()}
                                                    />
                                                )}
                                                <View style={styles.teamItemInfo}>
                                                    <Text style={styles.teamItemName}>{item.name}</Text>
                                                    {item.league && (
                                                        <Text style={styles.teamItemLeague}>{item.league}</Text>
                                                    )}
                                                </View>
                                            </View>
                                            {assigning && (
                                                <ActivityIndicator size="small" color="#2757CB" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </View>
                </Modal>
                
                <StyledAlert
                    visible={showStyledAlert}
                    config={alertConfig}
                    onClose={closeAlert}
                />
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
        justifyContent: 'center',
        alignItems: 'center'
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
    },
    sportsProfileContainer: {
        width: '100%',
        padding: 16,
    },
    sportCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sportName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2757CB',
        marginBottom: 8,
    },
    skillLevel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    position: {
        fontSize: 14,
        color: '#666',
    },
    noSportsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    assignButtonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'white',
    },
    assignButton: {
        backgroundColor: '#2757CB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        gap: 8,
    },
    assignButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalLoading: {
        padding: 40,
        alignItems: 'center',
    },
    noTeamsText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    createTeamButton: {
        backgroundColor: '#2757CB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    createTeamButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    teamItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    teamItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    teamItemInfo: {
        marginLeft: 15,
        flex: 1,
    },
    teamItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    teamItemLeague: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});

export default UserProfile;