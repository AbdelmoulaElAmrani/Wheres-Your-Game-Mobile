import React, { useEffect, useState, useMemo } from 'react';
import {
    ImageBackground,
    Keyboard,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavigationHeader from '@/components/CustomNavigationHeader';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Text, TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { useDispatch, useSelector } from 'react-redux';
import { getSports } from '@/redux/SportSlice';
import Sport from '@/models/Sport';

function TeamForm() {
    const dispatch = useDispatch();
    const [isAddTeam, setIsAddTeam] = useState(true);
    const [loading, setLoading] = useState(true);

    const availableSport = useSelector((state: any) => state.sport.evalbleSports) as Sport[];

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

    const memoizedSports = useMemo(() => availableSport, [availableSport]);

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
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Name</Text>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'Name'}
                                cursorColor={'black'}
                                placeholderTextColor={'grey'}
                                left={<TextInput.Icon color={'#D3D3D3'} icon='trophy-outline' />}
                                underlineColor="transparent"
                            />
                            <Text style={styles.textLabel}>Sport type</Text>
                            {(loading || !memoizedSports)
                                ? (
                                    <TextInput style={styles.inputStyle} placeholder={'Loading...'} cursorColor={'black'} placeholderTextColor={'grey'} editable={false} />
                                ) : (
                                    <RNPickerSelect
                                        style={{ inputIOS: styles.inputStyle, inputAndroid: styles.inputStyle }}
                                        items={memoizedSports.map((sport: Sport) => ({
                                            label: sport.name,
                                            value: sport.id,
                                            key: sport.id
                                        }))}
                                        placeholder={{ label: 'Select sport', value: null }}
                                        onValueChange={(value) => console.log(value)}
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
                            {/*TODO i want multi select here but i dont know how to do it with react-native-paper */}








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
});

export default TeamForm;
