import {Button, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {useState} from "react";
import {ImageBackground} from "expo-image";
import ReactNativeCalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import {he} from "react-native-paper-dates";
import {Entypo} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";


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


    const _onAddEvent = () => {

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
                        {user?.role == UserType[UserType.COACH] || true && <TouchableOpacity
                            onPress={_onAddEvent}
                            style={styles.addEventBtn}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>Add Event</Text>
                        </TouchableOpacity>}
                        {user?.role == UserType[UserType.COACH] || true &&
                            <Text style={{fontWeight: 'bold', fontSize: 20}}>All Events</Text>}
                        <View>
                            {user?.role == UserType[UserType.COACH] || true ?
                                <>
                                </> :
                                <>
                                </>}
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
    }
    }
);
export default Calendar;