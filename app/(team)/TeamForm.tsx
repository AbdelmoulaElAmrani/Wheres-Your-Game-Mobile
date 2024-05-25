import React, { useEffect, useState } from 'react';
import {
    ImageBackground,
    Keyboard,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavigationHeader from '@/components/CustomNavigationHeader';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Text, TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { useDispatch, useSelector } from 'react-redux';
import { getSports } from '@/redux/SportSlice';
import Sport from '@/models/Sport';
import { MultiSelect } from 'react-native-element-dropdown';
import CustomButton from '@/components/CustomButton';
import { AntDesign } from '@expo/vector-icons';
import { PlayerService } from '@/services/PlayerService';
import { TeamService } from '@/services/TeamService';
import { UserResponse } from '@/models/responseObjects/UserResponse';
import { getUserProfile } from '@/redux/UserSlice';
import { router } from 'expo-router';


function TeamForm() {
    const dispatch = useDispatch();
    const [isAddTeam, setIsAddTeam] = useState(true);
    const [loading, setLoading] = useState(true);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [team, setTeam] = useState<any>();
    

    const availableSport = useSelector((state: any) => state.sport.evalbleSports) as Sport[];
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;


    useEffect(() => {
        if (!availableSport || availableSport.length === 0) {
            const fetchSports = async () => {
                await dispatch(getSports() as any);
                setLoading(false);
            };
            fetchSports();
        } else {
            setLoading(false);
        }
    }, [dispatch, availableSport]);


    useEffect(() => {
        if (selectedSportId) {
            PlayerService.getAllPlayersIntressedOnSportByFilter(selectedSportId as string, '', '', 0).then(
                (response) => {
                    if (response) {
                        setPlayers(response);
                    }
                }
            )
        }
    }, [selectedSportId]);

    useEffect(() => {
        if (!userData?.id) {
            dispatch(getUserProfile() as any);
        }
    }, [userData]);




    const renderPlayerItem = (item: any) => {
        return (
            <View style={styles.item}>
                <Text style={styles.selectedTextStyle}>{item.label}</Text>
            </View>
        );
    };

    const _onCreateTeam = () => {
        const errors = [];
        if (!team?.name) {
            errors.push('Name is required');
        }
        if (!selectedSportId) {
            errors.push('Sport is required');
        }
       
        if (errors.length > 0) {
            Alert.alert('Error', errors.join('\n'));
            return;
        }


        TeamService.addTeam({
            ...team,
            sportId: selectedSportId,
            players: selectedPlayers,
            accountId: userData.id,
            imgUrl :''
        }).then((response) => {
            if (response) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', 'Failed to create team');
            }
        });

    };


    return (
        <ImageBackground
            style={{ flex: 1, width: '100%' }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <CustomNavigationHeader text={isAddTeam ? 'Create Team' : 'Edit Team'} showBackArrow />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.cardContainer}>
                        <Text style={styles.title}>{isAddTeam ? 'Create Team' : 'Edit Team'}</Text>
                        <View style={styles.formContainer}>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Name'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='trophy-outline' />}
                                    underlineColor="transparent"
                                    value={team?.name}
                                    onChangeText={(text) => setTeam({ ...team, name: text })}
                                />
                                <Text style={styles.textLabel}>Sport type</Text>
                                {(loading || !availableSport || availableSport.length === 0)
                                    ? (
                                        <TextInput style={styles.inputStyle} placeholder={'Loading...'} cursorColor={'black'} placeholderTextColor={'grey'} editable={false} />
                                    ) : (
                                        <RNPickerSelect
                                            style={{ inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle }}
                                            items={availableSport.map((sport: Sport) => ({
                                                label: sport.name,
                                                value: sport.id,
                                                key: sport.id
                                            }))}
                                            placeholder={{ label: 'Select sport', value: null }}
                                            onValueChange={(value) =>
                                                setSelectedSportId(value)
                                            }
                                            value={selectedSportId}

                                        />
                                    )}
                                <Text style={styles.textLabel}>Image</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Image'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='image' />}
                                    underlineColor="transparent"
                                    onPress={() => console.log('image')}
                                />
                                <Text style={styles.textLabel}>Players</Text>
                                <MultiSelect
                                    style={styles.inputStyle}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    containerStyle={styles.containerStyle}

                                    data={players.map((player: any) => ({
                                        label: player.firstName + ' ' + player.lastName,
                                        value: player.id
                                    }))}
                                    placeholder="Select players"
                                    value={selectedPlayers}
                                    search
                                    labelField="label"
                                    valueField="value"
                                    onChange={item => {
                                        setSelectedPlayers(item);
                                    }}
                                    iconStyle={styles.iconStyle}
                                    renderLeftIcon={() => (
                                        <AntDesign
                                            style={styles.icon}
                                            color="black"
                                            name="user"
                                            size={20}
                                        />
                                    )}
                                    renderItem={renderPlayerItem}
                                    selectedStyle={styles.selectedStyle}
                                />
                                <View style={{ marginTop: 90 }}>
                                    <CustomButton text='Create' onPress={_onCreateTeam} />
                                </View>


                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    cardContainer: {
        width: wp('100%'),
        height: hp('80%'),
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp('10%'),
    },
    title: {
        fontSize: 19,
        color: 'black',
        textAlign: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        fontFamily: 'mon-b',
        position: 'absolute',
        top: 10,
        width: '100%',
        padding: 10,
    },
    formContainer: {
        padding: 3,
        width: '100%',
        position: 'absolute',
        top: 50,
        alignSelf: 'center',

    },
    mgTop: {
        marginTop: hp('2%'),
    },
    textLabel: {
        color: 'black',
        fontSize: 16,
        marginTop: 10,
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: '#D3D3D3',
        borderWidth: 1,
    },
    placeholderStyle: {
        color: 'grey',
        fontSize: 16
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: 'grey',
        borderRadius: 10
    },
    icon: {
        marginRight: 10,
        marginLeft: 15,
        color: 'grey'
    },
    iconStyle: {
        width: 20,
        height: 20
    },
    item: {
        padding: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    containerStyle: {
        borderRadius: 15,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    selectedStyle: {
        borderRadius: 15,
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 0.3,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2.50,
        elevation: 5

    }
});

export default TeamForm;
