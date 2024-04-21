import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {
    heightPercentageToDP,
    heightPercentageToDP as hp,
    widthPercentageToDP as wp
} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {memo, useEffect, useState} from "react";
import {Image, ImageBackground} from "expo-image";
import ReactNativeCalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import {AntDesign, Entypo, Octicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {FlashList} from "@shopify/flash-list";
import {Avatar} from "react-native-paper";
import {Helpers} from "@/constants/Helpers";


const Calendar = () => {
    const user = useSelector((state: any) => state.user.userData) as UserResponse;
    const today = moment();
    const [selectedDate, setSelectedDate] = useState<moment.Moment>(today);
    const minDate = today.clone().add(1, 'months').toDate();
    const maxDate = today.clone().subtract(6, 'months').toDate();
    const [markedToday, setMarkedToday] = useState<any>(
        [{
            date: today,
            lines: [{color: 'white'}]
        }]
    );

    // replace this variable with useState or useMoment
    const eventData = [
        {
            id: '1',
            name: 'Event One',
            imageUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2_Sqd2wYWrnGHc6uY6OG0umC4IarkT5Awntkh8s1z2A&s',
            date: '2024-04-21',
            creator: 'coach'
        },
        {
            id: '2',
            name: 'Event Two',
            imageUri: '',
            date: '2024-04-20',
            creator: 'coach'
        },
        {
            id: '3',
            name: 'Event Three',
            imageUri: '',
            date: '2024-04-21',
            creator: 'other'
        },
        {
            id: '4',
            name: 'Event Three',
            imageUri: '',
            date: '2024-04-21',
            creator: 'other'
        },
        {
            id: '5',
            name: 'Event Three',
            imageUri: '',
            date: '2024-04-21',
            creator: 'other'
        },
        {
            id: '6',
            name: 'Event Three',
            imageUri: '',
            date: '2024-04-21',
            creator: 'other'
        },
        {
            id: '7',
            name: 'Event Three',
            imageUri: '',
            date: '2024-04-21',
            creator: 'other'
        },
    ];


    const _onAddEvent = (): void => {

    }

    const _onClickEvent = (event: any): void => {
        console.log(event);
    }

    function _onEditEvent(item: any): void {
    }

    const _renderEvent = memo(({item}: { item: any }) => {


        return (
            <TouchableOpacity
                onPress={() => _onClickEvent(item)}
                disabled={isCoach()}
                style={styles.eventContainer}>
                <View style={{flex: 0.25}}>
                    <Image
                        contentFit={"fill"}
                        style={{height: '100%', width: '100%', borderRadius: 10}}
                        source={Helpers.isObjectNullOrEmpty<string>(item.imageUri) ? require('../../assets/images/noimg.jpg') : {uri: item.imageUri}}/>
                </View>
                <View style={{flex: 0.75, paddingHorizontal: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 0.7}}>
                        <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.name}</Text>
                        {isCoach() &&
                            <Octicons onPress={() => _onEditEvent(item)} name="pencil" size={24} color="grey"/>
                        }
                    </View>
                    <Text style={{color: 'grey', flex: 0.3}}>
                        {isCoach() ? item.date : '17 Km | 9:00 am'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    });


    const isCoach = (): boolean => {
        return user?.role == UserType[UserType.COACH];
    }


    const getTitle = (): string => {
        if (isCoach())
            return 'All Events';
        else {
            const today = moment().startOf('day');
            const tomorrow = moment().add(1, 'days').startOf('day');
            const yesterday = moment().subtract(1, 'days').startOf('day');

            if (selectedDate.isSame(today, 'day')) {
                return "Today's Training";
            } else if (selectedDate.isSame(tomorrow, 'day')) {
                return "Tomorrow's Training";
            } else if (selectedDate.isSame(yesterday, 'day')) {
                return "Yesterday's Training";
            } else {
                return selectedDate.format('YYYY-MM-DD') + " 's Training";
            }
        }
    }

    return <>
        <StatusBar style="light"/>
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>

            <SafeAreaView style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <View style={{width: '100%'}}>
                        <ReactNativeCalendarStrip
                            dateNameStyle={{color: 'white'}}
                            dateNumberStyle={{color: 'white'}}
                            calendarHeaderStyle={{color: 'white'}}
                            highlightDateContainerStyle={{backgroundColor: '#E15B2D', borderRadius: 5}}
                            highlightDateNameStyle={{color: 'white'}}
                            highlightDateNumberStyle={{color: 'white'}}
                            dayContainerStyle={{height: 70}}
                            style={{height: 100}}
                            leftSelector={<Entypo name="chevron-left" size={30} color="white"/>}
                            rightSelector={<Entypo name="chevron-right" size={30} color="white"/>}
                            minDate={minDate}
                            maxDate={maxDate}
                            onDateSelected={(dt) => setSelectedDate(dt)}
                            selectedDate={selectedDate}
                            startingDate={moment()}
                            markedDates={markedToday}
                        />
                    </View>
                    <View style={styles.mainContainer}>
                        {isCoach() && <TouchableOpacity
                            onPress={_onAddEvent}
                            style={styles.addEventBtn}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>Add Event</Text>
                        </TouchableOpacity>}
                        <Text style={{fontWeight: 'bold', fontSize: 20}}>{getTitle()}</Text>
                        <View style={{marginTop: 10, height: '100%'}}>
                            <FlashList
                                data={eventData}
                                renderItem={({item, index}) => <_renderEvent item={item}/>}
                                keyExtractor={item => item.id}
                                estimatedItemSize={10}
                                contentContainerStyle={{backgroundColor: 'white', padding: 10}}
                                ListFooterComponent={<View style={{height: heightPercentageToDP(50)}}/>}
                            />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    </>
}

const styles = StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: 'white',
            borderTopEndRadius: 35,
            borderTopStartRadius: 35,
            paddingTop: 30,
            padding: 20,
            marginTop: 10,
            minHeight: hp(100),
            width: wp(100)
        },
    addEventBtn: {
        borderWidth: 1,
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#2757CB',
        alignSelf: "flex-end"
    },
    eventContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderColor: '#E9EDF9',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: "row",
        height: 80,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    }
    }
);
export default Calendar;