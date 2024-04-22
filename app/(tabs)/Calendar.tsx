import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
    heightPercentageToDP,
    heightPercentageToDP as hp,
    widthPercentageToDP as wp
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Image, ImageBackground } from "expo-image";
import ReactNativeCalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import { AntDesign, Entypo, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { UserResponse } from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import { FlashList } from "@shopify/flash-list";
import { Avatar, Modal, TextInput } from "react-native-paper";
import { Helpers } from "@/constants/Helpers";
import { DatePickerModal, enGB, registerTranslation, TimePickerModal } from 'react-native-paper-dates';
import CustomButton from "@/components/CustomButton";
import RNPickerSelect from 'react-native-picker-select';
import SportLevel from "@/models/SportLevel";



const Calendar = () => {
    const user = useSelector((state: any) => state.user.userData) as UserResponse;
    const today = moment();
    const [selectedDate, setSelectedDate] = useState<moment.Moment>(today);
    const minDate = today.clone().add(1, 'months').toDate();
    const maxDate = today.clone().subtract(6, 'months').toDate();
    const [markedToday, setMarkedToday] = useState<any>(
        [{
            date: today,
            lines: [{ color: 'white' }]
        }]
    );
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [eventDate, setEventDate] = useState<Date | null>(null);

    const [event, setEvent] = useState<any>({ name: '', date: new Date(), time: '', type: [], level: [] ,ageGroup: ''});
    const [time, setTime] = useState<any>({ hours: new Date().getHours(), minutes: new Date().getMinutes() });
    const [timeOpen, setTimeOpen] = useState(false);
    const [currentModalStep, setCurrentModalStep] = useState<number>(1);
    const [options, setOptions] = useState([
        { title: 'League', isChecked: false },
        { title: 'Tournament', isChecked: false },
        { title: 'Pick Up Game', isChecked: false },
        { title: 'Ref', isChecked: false },
        { title: 'Umpire', isChecked: false },
        { title: 'Official', isChecked: false },
        { title: 'Compettition', isChecked: false },
        { title: 'Meet', isChecked: false },
        { title: 'Match', isChecked: false },
        { title: 'All', isChecked: false }

    ]);

    const [selectedSportLevel, setSelectedSportLevel] = useState<string[]>([]);



    registerTranslation("en", enGB);


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

    const sportLevels = Object.keys(SportLevel).filter((key: string) => !isNaN(Number(SportLevel[key as keyof typeof SportLevel])));
    sportLevels.push('All');

    const _onAddEvent = (): void => {
        showModal();

    }

    const _onClickEvent = (event: any): void => {
        console.log(event);
    }

    function _onEditEvent(item: any): void {
    }

    const showModal = () => setIsModalVisible(true);
    const hideModal = () => setIsModalVisible(false);

    const onDismissSingle = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onConfirmSingle = useCallback(
        (params: any) => {
            setOpen(false);
        },
        [setOpen]
    );

    const onDismissTime = useCallback(() => {
        setTimeOpen(false);
    }, [setTimeOpen]);

    const onConfirmTime = useCallback(
        (params: any) => {
            setTimeOpen(false);
            setTime({ hours: params.hours, minutes: params.minutes });
            setEvent({ ...event, time: params.hours + ':' + params.minutes });
        },
        [setTimeOpen]
    );

    const generateAgeRanges = (start: number, end: number) => {
        const ranges = [];
        for (let age = start; age <= end; age++) {
            ranges.push({ label: `U-${age}`, value: `U-${age}` });
        }
        ranges.push({ label: 'Senior', value: 'Senior' });
        return ranges;
    };

    const _handleAddEventContinue = () => {
        setCurrentModalStep(old => Math.min(3, old + 1));
        if (currentModalStep === 3) {
            console.log({...event, type: options.filter(option => option.isChecked).map(option => option.title), level: selectedSportLevel , ageGroup: event.ageGroup});
            hideModal();
            setEvent({ name: '', date: new Date(), time: '', type: [], level: [], ageGroup: '' });
            setTime({ hours: new Date().getHours(), minutes: new Date().getMinutes() });
            setSelectedSportLevel([]);
            setCurrentModalStep(1);

        }
    }
    const _handleAddEventBack = () => {
        setCurrentModalStep(old => Math.max(1, old - 1));
    }

    const _handlePress = (index: number) => {
        setOptions(prevOptions => {
            const updatedOptions = [...prevOptions];
            const selectedOption = updatedOptions[index].title;
    
            if (selectedOption === 'All') {
                const isChecked = !updatedOptions[index].isChecked;
                updatedOptions.forEach(option => {
                    option.isChecked = isChecked;
                });
            } else {
                updatedOptions[index].isChecked = !updatedOptions[index].isChecked;
            }
    
            return updatedOptions;
        });
    };

    interface CheckboxProps {
        title: string;
        isChecked: boolean;
        onPress: () => void;
    }

    const Checkbox = ({ title, isChecked, onPress }: CheckboxProps) => {
        return (
            <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
                <MaterialCommunityIcons
                    name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={24}
                    color="black"
                />
                <Text style={styles.text}>{title}</Text>
            </TouchableOpacity>
        );
    };

    const _handleLevelPress = (index: number) => {
        const selectedLevel = sportLevels[index];
        
        if (selectedLevel === 'All') {
            if (selectedSportLevel.includes('All')) {
                setSelectedSportLevel([]);
            } else {
                setSelectedSportLevel([...sportLevels]);
            }
            return;
        }
    
        const newSelectedLevels = selectedSportLevel.includes(selectedLevel)
            ? selectedSportLevel.filter(level => level !== selectedLevel)
            : [...selectedSportLevel, selectedLevel];
    
        if (newSelectedLevels.length === sportLevels.length - 1) {
            setSelectedSportLevel([...newSelectedLevels, 'All']);
        } else {
            setSelectedSportLevel(newSelectedLevels);
        }
    };
    
    
    



    const _renderEvent = memo(({ item }: { item: any }) => {


        return (
            <TouchableOpacity
                onPress={() => _onClickEvent(item)}
                disabled={isCoach()}
                style={styles.eventContainer}>
                <View style={{ flex: 0.25 }}>
                    <Image
                        contentFit={"fill"}
                        style={{ height: '100%', width: '100%', borderRadius: 10 }}
                        source={Helpers.isObjectNullOrEmpty<string>(item.imageUri) ? require('../../assets/images/noimg.jpg') : { uri: item.imageUri }} />
                </View>
                <View style={{ flex: 0.75, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 0.7 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                        {isCoach() &&
                            <Octicons onPress={() => _onEditEvent(item)} name="pencil" size={24} color="grey" />
                        }
                    </View>
                    <Text style={{ color: 'grey', flex: 0.3 }}>
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
        <StatusBar style="light" />
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}>

            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ width: '100%' }}>
                        <ReactNativeCalendarStrip
                            dateNameStyle={{ color: 'white' }}
                            dateNumberStyle={{ color: 'white' }}
                            calendarHeaderStyle={{ color: 'white' }}
                            highlightDateContainerStyle={{ backgroundColor: '#E15B2D', borderRadius: 5 }}
                            highlightDateNameStyle={{ color: 'white' }}
                            highlightDateNumberStyle={{ color: 'white' }}
                            dayContainerStyle={{ height: 70 }}
                            style={{ height: 100 }}
                            leftSelector={<Entypo name="chevron-left" size={30} color="white" />}
                            rightSelector={<Entypo name="chevron-right" size={30} color="white" />}
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
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Add Event</Text>
                        </TouchableOpacity>}
                        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{getTitle()}</Text>
                        <View style={{ marginTop: 10, height: '100%' }}>
                            <FlashList
                                data={eventData}
                                renderItem={({ item, index }) => <_renderEvent item={item} />}
                                keyExtractor={item => item.id}
                                estimatedItemSize={10}
                                contentContainerStyle={{ backgroundColor: 'white', padding: 10 }}
                                ListFooterComponent={<View style={{ height: heightPercentageToDP(50) }} />}
                            />
                        </View>
                    </View>
                    <Modal visible={isModalVisible} onDismiss={hideModal} contentContainerStyle={styles.addEventModal}>
                        <View style={styles.addEventModalTitle}>
                            <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Add Event</Text>
                        </View>

                        <View style={styles.addEventModalFormContainer}>

                            {currentModalStep === 1 && (
                                <>
                                    <Text style={styles.textLabel}>Date and Time of Event</Text>
                                    <DatePickerModal
                                        mode="single"
                                        visible={open}
                                        onDismiss={onDismissSingle}
                                        date={event.date}
                                        onConfirm={onConfirmSingle}
                                        saveLabel="Select Date"
                                        label="Select Date"
                                        animationType="slide"
                                        locale="en"
                                        onChange={(p) => {
                                            if (p && p.date) {
                                                setEvent({ ...event, date: p.date })
                                            }
                                        }
                                        }
                                    />
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Date of Event'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='calendar' size={30} />}
                                        value={event?.date.toDateString()}
                                        onFocus={() => setOpen(true)}
                                        underlineColor={"transparent"}

                                    />
                                    <TimePickerModal
                                        visible={timeOpen}
                                        onDismiss={onDismissTime}
                                        onConfirm={onConfirmTime}
                                        label="Select time of event"
                                        locale="en"
                                        hours={time.hours}
                                        minutes={time.minutes}
                                        animationType="slide"


                                    />
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Time of Event'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='clock' size={30} />}
                                        value={time.hours + ':' + time.minutes}
                                        onFocus={() => setTimeOpen(true)}
                                        underlineColor={"transparent"}

                                    />

                                    <Text style={styles.textLabel}>Event Name</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Event Name'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        left={<TextInput.Icon color={'#D3D3D3'} icon='star' size={30} />}
                                        underlineColor={"transparent"}
                                        value={event.name}
                                        onChangeText={(text) => setEvent({ ...event, name: text })}

                                    />
                                    <Text style={styles.textLabel}>Age Group</Text>
                                    <RNPickerSelect

                                        items={
                                            generateAgeRanges(6, 18)
                                        }
                                        onValueChange={(value) => setEvent({ ...event, ageGroup: value })}
                                        style={{
                                            inputAndroid: {
                                                ...styles.inputStyle,
                                                color: 'grey'
                                            },
                                            inputIOS: {
                                                ...styles.inputStyle,
                                                color: 'grey'
                                            },
                                            iconContainer: {
                                                top: 18,
                                                right: 12,
                                            },
                                        }}

                                        Icon={() => {
                                            return <AntDesign name="down" size={20} color="grey" />;
                                        }}

                                    />
                                </>
                            )}


                            {currentModalStep === 2 && (
                                <>
                                    <Text style={styles.textLabel}>Event Type</Text>
                                    <View style={styles.containerOptions}>
                                        {options.map((option, index) => (
                                            <Checkbox
                                                key={index}
                                                title={option.title}
                                                isChecked={option.isChecked}
                                                onPress={() => _handlePress(index)}
                                            />
                                        ))}
                                    </View>


                                </>
                            )}

                            {currentModalStep === 3 && (
                                <>
                                    <Text style={styles.textLabel}>Level of Play</Text>
                                    <View style={styles.containerOptions}>
                                        {sportLevels.map((key: string, index) => (
                                            <Checkbox
                                                key={index}
                                                title={key}
                                                isChecked={selectedSportLevel.includes(key)}
                                                onPress={() => _handleLevelPress(index)}
                                            />
                                        ))}




                                    </View>


                                </>
                            )}






                        </View>

                        {currentModalStep === 1 && (
                            <View style={styles.bottomCardContainer}>
                                <CustomButton text="continue" onPress={_handleAddEventContinue} />
                            </View>
                        )}

                        {currentModalStep !== 1 && currentModalStep !== 3 && (
                            <View style={styles.bottomRowContainer}>
                                <CustomButton text="back" onPress={_handleAddEventBack} style={styles.backButton} textStyle={styles.buttonText} />
                                <CustomButton text="continue" onPress={_handleAddEventContinue} style={styles.continueButton} />
                            </View>
                        )}

                        {currentModalStep === 3 && (
                            <View style={styles.bottomRowContainer}>
                                <CustomButton text="back" onPress={_handleAddEventBack} style={styles.backButton} textStyle={styles.buttonText} />
                                <CustomButton text="Save" onPress={_handleAddEventContinue} style={styles.continueButton} />
                            </View>
                        )}





                    </Modal>
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    addEventModal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 20,
        height: hp(70),
        width: wp(90),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: hp(8)

    },
    addEventModalTitle: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        paddingTop: 20,
    },
    addEventModalFormContainer: {
        width: '100%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 50
    },
    textLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 5,
        marginLeft: 10,
        alignSelf: 'flex-start'
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 10,

    },
    bottomCardContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    bottomRowContainer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        justifyContent: 'space-around'

    },
    backButton: {
        backgroundColor: 'white',
        borderColor: '#2757CB',
        borderWidth: 1,
        width: wp(35),
        height: 55,
        borderRadius: 30,

    },
    continueButton: {
        backgroundColor: "#2757CB",
        width: wp(35),
        height: 55,
        borderRadius: 30,
        alignSelf: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 20,
        color: '#2757CB',
        textAlign: 'center'
    },
    containerOptions: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        marginLeft: 10,
        marginTop: 10

    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginLeft: 15
    },
    text: {
        fontSize: 16,
        marginLeft: 15,
    }


}
);
export default Calendar;