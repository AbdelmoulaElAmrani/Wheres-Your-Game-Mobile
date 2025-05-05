import React, {useCallback, useEffect, useState} from 'react';
import {
    ImageBackground,
    View,
    StyleSheet,
    Alert
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomNavigationHeader from '@/components/CustomNavigationHeader';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {Text, TextInput} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import {useDispatch, useSelector} from 'react-redux';
import {getSports} from '@/redux/SportSlice';
import Sport from '@/models/Sport';
import {MultiSelect} from 'react-native-element-dropdown';
import CustomButton from '@/components/CustomButton';
import {AntDesign} from '@expo/vector-icons';
import {PlayerService} from '@/services/PlayerService';
import {TeamService} from '@/services/TeamService';
import {UserResponse} from '@/models/responseObjects/UserResponse';
import {getUserProfile} from '@/redux/UserSlice';
import {router} from 'expo-router';
import * as ImagePicker from "expo-image-picker";
import {manipulateAsync, SaveFormat} from "expo-image-manipulator";
import {StorageService} from '@/services/StorageService';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {DatePickerModal, enGB, registerTranslation, TimePickerModal} from 'react-native-paper-dates';
import OverlaySpinner from '@/components/OverlaySpinner';
import {OrganizationService} from "@/services/OrganizationService";


function TeamForm() {
    const dispatch = useDispatch();
    const [isAddTeam, setIsAddTeam] = useState(true);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [team, setTeam] = useState<any>();
    const [manipulatedImageUri, setManipulatedImageUri] = useState<any>(null);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    registerTranslation('en', enGB);


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
            PlayerService.getAllPlayersIntressedOnSportByFilter(selectedSportId, '', '', 0).then(
                (response) => {
                    if (response)
                        setPlayers(response);
                }
            ).catch(e => console.error(e));
        }
    }, [selectedSportId]);

    useEffect(() => {
        if (!userData?.id) {
            dispatch(getUserProfile() as any);
        }
        if (userData.id) {
            _fetchCoachOrganization();
        }
    }, [userData]);


    const _fetchCoachOrganization = async () => {
        const data: UserResponse[] = await OrganizationService.getOrganizationsByCoachId(userData.id);
        setOrganizations(data);
    }

    const renderPlayerItem = (item: { label: string, value: any }, selected?: boolean) => {
        return (
            <View style={styles.item}>
                {selected ?
                    <Text style={{fontSize: 14, color: 'white', fontWeight: 'bold'}}>{item.label}</Text>
                    : <Text style={{fontSize: 14,}}>{item.label}</Text>}
            </View>
        );
    };

    const _onCreateTeam = async () => {
        const errors = [];

        if (!team?.name)
            errors.push('Name is required');

        if (!selectedSportId)
            errors.push('Sport is required');

        if (errors.length > 0) {
            Alert.alert('Error', errors.join('\n'));
            return;
        }

        try {
            setCreating(true);
            const response = await TeamService.createTeam({
                ...team,
                sportId: selectedSportId,
                organizationId: selectedOrganizationId,
                players: selectedPlayers,
                accountId: userData.id,
                imgUrl: '',
                founded: team?.founded ? new Date(team.founded).toISOString().split('T')[0] : null
            });

            if (response) {
                if (manipulatedImageUri) {
                    const formData = new FormData();
                    formData.append('file', manipulatedImageUri);
                    try {
                        const imageUrl = await StorageService.upload(response.id, formData, false);
                    } catch (err) {
                        console.error('Error during image upload:', err);
                    }
                }
                setCreating(false);

                router.replace('/(tabs)');
            } else {
                setCreating(false);
                Alert.alert('Error', 'Failed to create team');
            }
        } catch (e) {
            setCreating(false);
            console.error(e);
            Alert.alert('Error', 'Something went wrong ' + e);
        }
    };

    const _handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.2
        });

        if (!result.canceled) {
            try {
                const manipulateImgResult = await manipulateAsync(result.assets[0].uri, [{
                    resize: {
                        height: 900,
                        width: 900
                    }
                }], {
                    compress: 0.2,
                    format: SaveFormat.PNG
                });

                setManipulatedImageUri({
                    uri: manipulateImgResult.uri,
                    name: result.assets[0].fileName ? result.assets[0].fileName : 'teamImage.png',
                    type: 'image/png'
                });
            } catch (err) {
                console.error('Error during image manipulation:', err);
            }
        }
    };
    const onConfirmSingle = useCallback(
        (params: any) => {
            setOpenDatePicker(false);
        },
        [setOpenDatePicker]
    );


    return (
        <ImageBackground
            style={{flex: 1, width: '100%'}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView style={{flex: 1}}>
                {creating && <OverlaySpinner visible={creating}/>}
                <CustomNavigationHeader text={isAddTeam ? 'Create Team' : 'Edit Team'} showBackArrow/>
                <View style={styles.cardContainer}>
                    <KeyboardAwareScrollView
                        contentContainerStyle={{paddingBottom: 90}}
                        style={{flex: 1}}>
                        <View style={styles.formContainer}>
                            <Text style={styles.title}>{isAddTeam ? 'Create Team' : 'Edit Team'}</Text>
                            <View style={styles.mgTop}>
                                <Text style={styles.textLabel}>Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Name'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='trophy-outline'/>}
                                    underlineColor="transparent"
                                    value={team?.name}
                                    onChangeText={(text) => setTeam({...team, name: text})}
                                />
                                <Text style={styles.textLabel}>Organization</Text>
                                {(loading || !organizations)
                                    ? (
                                        <TextInput style={styles.inputStyle} placeholder={'Loading...'}
                                                   cursorColor={'black'} placeholderTextColor={'grey'}
                                                   editable={false}/>
                                    ) : (
                                        <RNPickerSelect
                                            style={{
                                                inputIOS: [styles.inputStyle, {paddingLeft: 15}],
                                                inputAndroid: [styles.inputStyle, {paddingLeft: 15}]
                                            }}
                                            items={organizations.map((org: UserResponse) => ({
                                                label: org.organizationName?.trim() ? org.organizationName : `${org.firstName} ${org.lastName}`,
                                                value: org.id,
                                                key: org.id,
                                                color: '#000'
                                            }))}
                                            placeholder={{label: 'Select Organization', value: null}}
                                            onValueChange={(value) =>
                                                setSelectedOrganizationId(value)
                                            }
                                            value={selectedOrganizationId}
                                        />
                                    )}
                                <Text style={styles.textLabel}>Sport type</Text>
                                {(loading || !availableSport || availableSport.length === 0)
                                    ? (
                                        <TextInput style={styles.inputStyle} placeholder={'Loading...'}
                                                   cursorColor={'black'} placeholderTextColor={'grey'}
                                                   editable={false}/>
                                    ) : (
                                        <RNPickerSelect
                                            style={{
                                                inputIOS: [styles.inputStyle, {paddingLeft: 15}],
                                                inputAndroid: [styles.inputStyle, {paddingLeft: 15}]
                                            }}
                                            items={availableSport.map((sport: Sport) => ({
                                                label: sport.name,
                                                value: sport.id,
                                                key: sport.id,
                                                color: '#000'
                                            }))}
                                            placeholder={{label: 'Select sport', value: null}}
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
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='image'/>}
                                    underlineColor="transparent"
                                    onPress={_handleImagePicker}
                                    disabled={true}
                                    value={(manipulatedImageUri || team?.imgUrl) ? 'Image selected' : 'select image'}
                                />
                                <Text style={styles.textLabel}>Address</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Address'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='map-marker-outline'/>}
                                    underlineColor="transparent"
                                    value={team?.address}
                                    onChangeText={(text) => setTeam({...team, address: text})}
                                />
                                <Text style={styles.textLabel}>Country</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Country'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='earth'/>}
                                    underlineColor="transparent"
                                    value={team?.country}
                                    onChangeText={(text) => setTeam({...team, country: text})}
                                />
                                <Text style={styles.textLabel}>Foundation date</Text>
                                {/* <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'yyyy-mm-dd'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='calendar'/>}
                                    underlineColor="transparent"
                                    value={team?.founded}
                                    onChangeText={(text) => setTeam({...team, founded: text})}
                                /> */}
                                <DatePickerModal
                                    locale="en"
                                    mode="single"
                                    visible={openDatePicker}
                                    onDismiss={() => setOpenDatePicker(false)}
                                    onConfirm={onConfirmSingle}
                                    date={team?.founded ? new Date(team.founded) : new Date()}
                                    saveLabel="Save"
                                    label="Select date"
                                    animationType="slide"
                                    onChange={(p) => {
                                        if (p && p.date) {
                                            setTeam({...team, founded: p.date});
                                        }
                                    }}
                                />

                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'yyyy-mm-dd'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='calendar'/>}
                                    underlineColor="transparent"
                                    value={team?.founded ? new Date(team.founded).toISOString().split('T')[0] : ''}
                                    onFocus={() => setOpenDatePicker(true)}
                                />
                                <Text style={styles.textLabel}>League</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'League'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='trophy-outline'/>}
                                    underlineColor="transparent"
                                    value={team?.league}
                                    onChangeText={(text) => setTeam({...team, league: text})}
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
                                        value: player.id,
                                        color: '#000'
                                    }))}
                                    placeholder="Select players"
                                    value={selectedPlayers}
                                    search
                                    labelField="label"
                                    valueField="value"
                                    onChange={item => {
                                        if (item.length < 15)
                                            setSelectedPlayers(item);
                                        else
                                            Alert.alert("The maximum number of players allowed is 15. You have reached this limit.");
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
                                    activeColor='#4564f5'
                                />
                                <View style={{marginTop: 90}}>
                                    <CustomButton text='Create' onPress={_onCreateTeam}/>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
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
        position: "absolute",
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        paddingHorizontal: 20,
        marginTop: hp('22%'),
        flex: 1
    },
    title: {
        fontSize: 19,
        color: 'black',
        textAlign: 'center',
        alignSelf: 'center',
        fontFamily: 'mon-b',
        width: '100%',
    },
    formContainer: {
        padding: 3,
        width: '100%',
        top: 30,
        alignSelf: 'center',
    },
    mgTop: {
        marginTop: hp('2%'),
        height: '100%'
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
        borderWidth: 1
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
        shadowOffset: {width: 0, height: 2},
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
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.25,
        shadowRadius: 2.50,
        elevation: 5

    }
});

export default TeamForm;
