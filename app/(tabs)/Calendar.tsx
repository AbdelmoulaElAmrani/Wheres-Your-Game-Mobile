import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {
    heightPercentageToDP,
    heightPercentageToDP as hp,
    widthPercentageToDP as wp
} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {memo, useCallback, useEffect, useState} from "react";
import {Image, ImageBackground} from "expo-image";
import ReactNativeCalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import {AntDesign, Entypo, Octicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {FlashList} from "@shopify/flash-list";
import {ActivityIndicator, MD2Colors, Modal, TextInput} from "react-native-paper";
import {Helpers} from "@/constants/Helpers";
import {DatePickerModal, enGB, registerTranslation, TimePickerModal} from 'react-native-paper-dates';
import CustomButton from "@/components/CustomButton";
import RNPickerSelect from 'react-native-picker-select';
import SportLevel from "@/models/SportLevel";
import Checkbox from "expo-checkbox";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {unsubscribeFromKeyboardEvents} from "react-native-reanimated/lib/typescript/reanimated2/core";
import {EventService} from "@/services/EventService";
import {List} from "lodash";
import {SportEvent} from "@/models/SportEvent";
import {EventSearchRequest} from "@/models/requestObjects/EventSearchRequest";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import { SportEventRequest } from "@/models/requestObjects/SportEventRequest";


const Calendar = () => {

    const user = useSelector((state: any) => state.user.userData) as UserResponse;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
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

    const [editMode, setEditMode] = useState<boolean>(false);
    // EVENT MODAL
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [eventDate, setEventDate] = useState<Date | null>(null);

    const [event, setEvent] = useState<any>({name: '', date: new Date(), time: '', type: [], level: [], ageGroup: ''});
    const [time, setTime] = useState<any>({hours: new Date().getHours(), minutes: new Date().getMinutes()});
    const [timeOpen, setTimeOpen] = useState(false);
    const [currentModalStep, setCurrentModalStep] = useState<number>(1);
    const [options, setOptions] = useState([
        {title: 'League', isChecked: false},
        {title: 'Tournament', isChecked: false},
        {title: 'Pick Up Game', isChecked: false},
        {title: 'Ref', isChecked: false},
        {title: 'Umpire', isChecked: false},
        {title: 'Official', isChecked: false},
        {title: 'Compettition', isChecked: false},
        {title: 'Meet', isChecked: false},
        {title: 'Match', isChecked: false},
        {title: 'All', isChecked: false}

    ]);

    useEffect(() => {
        setIsLoaded(true);
        if (user.role == UserType[UserType.COACH]) {
            getCoachEvents();
        } else {
            getUserEvents();
        }
    }, [selectedDate, user.id]);

    const [selectedSportLevel, setSelectedSportLevel] = useState<string[]>([]);
    registerTranslation("en", enGB);
    const [events, setEvents] = useState<SportEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const sportLevels = Object.keys(SportLevel).filter((key: string) => !isNaN(Number(SportLevel[key as keyof typeof SportLevel])));
    sportLevels.push('All');


    const getCoachEvents = async () => {
        try {
            const events = await EventService.getCoachEvents(user.id, today.format('YYYY-MM-DDT00:00:00'), 0, 100);
            if (events?.content) {
                setEvents(events.content);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoaded(false);
        }
    }

    const getUserEvents = async () => {
        try {
            // todo:: to be completed
            //const body: EventSearchRequest = {date: selectedDate, zipCode: '', sportIds: [userSport.]};
            const events = await EventService.getUserEvents({
                date: selectedDate.toDate(),
                zipCode: "",
                sportIds: []
            });
            if (events?.content) {
                setEvents(events.content);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoaded(false);
        }
    }

    const _onAddEvent = (): void => {
        showModal();
    }

    const _onClickEvent = (event: any): void => {
        console.log(event);
    }

    function _onEditEvent(item: any): void {
        setEditMode(true);
        setEvent({
            name: item?.name,
            ageGroup: item?.ageGroup,
            level: item?.level,
            date: item?.date,
            time: item?.time
        });

        if (item.date) {
            setEventDate(new Date(item?.date));
        }

        if (item.time) {
            const [hours, minutes] = item.time.split(':');
            setTime({hours: parseInt(hours, 10), minutes: parseInt(minutes, 10)});
        }
        showModal();
    }

    const showModal = () => {
        setTime({hours: new Date().getHours(), minutes: new Date().getMinutes()});
        setIsModalVisible(true);
    }
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
            setTime({hours: params.hours, minutes: params.minutes});
            setEvent({...event, time: params.hours + ':' + params.minutes});
        },
        [setTimeOpen]
    );

    const generateAgeRanges = (start: number, end: number) => {
        const ranges = [];
        for (let age = start; age <= end; age++) {
            ranges.push({label: `U-${age}`, value: `U-${age}`});
        }
        ranges.push({label: 'Senior', value: 'Senior'});
        return ranges;
    };

    const _handleAddEventContinue = async () => {
        setCurrentModalStep(old => Math.min(3, old + 1));
        if (currentModalStep === 3) {

            try {
                var createdEvent = await EventService.createEvent({
                    name: event.name,
                description: selectedSportLevel.join(', ') + ' ' + event.ageGroup + ' ' + options.filter(option => option.isChecked).map(option => option.title).join(', '), //TODO:: Add description after validation
                    ownerId: user.id,
                    zipCode: '', // TODO:: Add zip code after validation
                    eventDate: moment(event.date).format('YYYY-MM-DDTHH:mm:ss')

                } as SportEventRequest);

                if (createdEvent) {
                    setEvents([...events, createdEvent]);
                }



            } catch (error) {
                console.log(error);
            }
            


            // console.log({
            //     ...event,
            //     type: options.filter(option => option.isChecked).map(option => option.title),
            //     level: selectedSportLevel,
            //     ageGroup: event.ageGroup
            // });
            if (editMode) {
                // TODO:: Edit
            } else {
                // TODO:: Create
            }
            _handleCancelEventCreation();
            /*hideModal();
            setEvent({name: '', date: new Date(), time: '', type: [], level: [], ageGroup: ''});
            setTime({hours: new Date().getHours(), minutes: new Date().getMinutes()});
            setSelectedSportLevel([]);
            setCurrentModalStep(1);*/
        }
    }
    const _handleAddEventBack = () => {
        setCurrentModalStep(old => Math.max(1, old - 1));
    }

    const _handleCancelEventCreation = () => {
        hideModal();
        setSelectedSportLevel([]);
        setCurrentModalStep(1);
        setEvent({name: '', date: new Date(), time: '', type: [], level: [], ageGroup: ''});
        setOpen(false);
        setEventDate(null);
        setTimeOpen(false);
        setEditMode(false);
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

    const CustomCheckbox = ({title, isChecked, onPress}: CheckboxProps) => {
        return (
            <View style={styles.checkboxContainer}>
                <Checkbox
                    value={isChecked}
                    onValueChange={onPress}
                    color={isChecked ? '#2757CB' : 'black'}
                />
                <Text style={styles.text}>{title}</Text>
            </View>
        );
    };

    const _handleLevelPress = (index: number) => {
        const selectedLevel = sportLevels[index];

        if (selectedLevel === 'All') {
            if (selectedSportLevel.includes('All')) setSelectedSportLevel([]);
            else setSelectedSportLevel([...sportLevels]);
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


    const _renderEvent = memo(({item}: { item: SportEvent }) => {

        return (
            <TouchableOpacity
                onPress={() => _onClickEvent(item)}
                disabled={isCoach()}
                style={styles.eventContainer}>
                <View style={{flex: 0.25}}>
                    <Image
                        contentFit={"fill"}
                        style={{height: '100%', width: '100%', borderRadius: 10}}
                        source={require('../../assets/images/noimg.jpg')}/>
                </View>
                <View style={{flex: 0.75, paddingHorizontal: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 0.7}}>
                        <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.name}</Text>
                        {isCoach() &&
                            <Octicons onPress={() => _onEditEvent(item)} name="pencil" size={24} color="grey"/>}
                    </View>
                    <Text style={{color: 'grey', flex: 0.3}}>
                        {isCoach() ? moment(item.eventDate).format('YYYY-MM-DD') : '17 Km | 9:00 am'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    });


    const isCoach = (): boolean => user?.role == UserType[UserType.COACH];


    const getTitle = (): string => {
        if (isCoach())
            return 'All Events';
        else {
            const today = moment().startOf('day');
            const tomorrow = moment().add(1, 'days').startOf('day');
            const yesterday = moment().subtract(1, 'days').startOf('day');

            if (selectedDate.isSame(today, 'day')) {
                return "Today's Event";
            } else if (selectedDate.isSame(tomorrow, 'day')) {
                return "Tomorrow's Event";
            } else if (selectedDate.isSame(yesterday, 'day')) {
                return "Yesterday's Event";
            } else {
                return selectedDate.format('YYYY-MM-DD') + " 's Event";
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
                            {isLoaded ? <ActivityIndicator animating={true} color={MD2Colors.blueGrey800} size={50}
                                                           style={{marginTop: 50}}/> :
                                (
                                    <FlashList
                                        data={events}
                                        renderItem={({item, index}) => <_renderEvent item={item}/>}
                                        keyExtractor={item => item.id.toString()}
                                        estimatedItemSize={10}
                                        contentContainerStyle={{backgroundColor: 'white', padding: 10}}
                                        ListFooterComponent={<View style={{height: heightPercentageToDP(50)}}/>}
                                    />
                                )}
                        </View>
                    </View>
                </View>
                <Modal visible={isModalVisible} onDismiss={_handleCancelEventCreation}
                       contentContainerStyle={styles.addEventModal}>
                    <Text style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        marginTop: 30
                    }}>{editMode ? 'Edit Event' : 'Create Event'}</Text>
                    <View style={[styles.addEventModalFormContainer]}>
                        {currentModalStep === 1 && (
                            <KeyboardAwareScrollView>
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
                                        if (p && p.date) setEvent({...event, date: p.date})
                                    }}/>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Date of Event'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='calendar' size={30}/>}
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
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='clock' size={30}/>}
                                    value={time.hours + ':' + time.minutes}
                                    onFocus={() => setTimeOpen(true)}
                                    underlineColor={"transparent"}
                                />

                                <Text style={[styles.textLabel, {marginTop: 20}]}>Event Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Event Name'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='star' size={30}/>}
                                    underlineColor={"transparent"}
                                    value={event.name}
                                    onChangeText={(text) => setEvent({...event, name: text})}
                                />
                                <Text style={[styles.textLabel, {marginTop: 20}]}>Age Group</Text>
                                <RNPickerSelect
                                    items={generateAgeRanges(6, 18)}
                                    onValueChange={(value) => setEvent({...event, ageGroup: value})}
                                    style={{
                                        inputAndroid: {...styles.inputStyle, color: 'grey'},
                                        inputIOS: {...styles.inputStyle, color: 'grey'},
                                        iconContainer: {top: 18, right: 12}
                                    }}
                                    Icon={() => <AntDesign name="down" size={20} color="grey"/>}/>
                            </KeyboardAwareScrollView>
                        )}

                        {currentModalStep === 2 && (
                            <ScrollView contentContainerStyle={{paddingHorizontal: 20}}>
                                <Text style={[styles.textLabel, {marginBottom: 20, textAlign: 'center', fontSize: 16}]}>Event
                                    Type</Text>
                                <View style={{marginTop: 30}}>
                                    {options.map((option, index) => (
                                        index % 2 === 0 && (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginBottom: 40
                                            }}>
                                                <CustomCheckbox
                                                    title={options[index].title}
                                                    isChecked={options[index].isChecked}
                                                    onPress={() => _handlePress(index)}
                                                />
                                                {options[index + 1] ? (
                                                    <CustomCheckbox
                                                        title={options[index + 1].title}
                                                        isChecked={options[index + 1].isChecked}
                                                        onPress={() => _handlePress(index + 1)}
                                                    />
                                                ) : ""}
                                            </View>
                                        )
                                    ))}
                                </View>
                            </ScrollView>
                        )}

                        {currentModalStep === 3 && (
                            <ScrollView>
                                <Text style={[styles.textLabel, {marginBottom: 20, textAlign: 'center', fontSize: 16}]}>Level
                                    of Play</Text>
                                <View style={{marginTop: hp(5), marginLeft: wp(10)}}>
                                    {sportLevels.map((key: string, index) => (
                                        index % 2 === 0 && (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                marginBottom: 40,
                                            }}>
                                                <CustomCheckbox
                                                    key={index}
                                                    title={sportLevels[index]}
                                                    isChecked={selectedSportLevel.includes(sportLevels[index])}
                                                    onPress={() => _handleLevelPress(index)}
                                                />
                                                {sportLevels[index + 1] ? (
                                                    <CustomCheckbox
                                                        key={index + 1}
                                                        title={sportLevels[index + 1]}
                                                        isChecked={selectedSportLevel.includes(sportLevels[index + 1])}
                                                        onPress={() => _handleLevelPress(index + 1)}
                                                    />
                                                ) : ""}
                                            </View>
                                        )
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>

                    {currentModalStep === 1 && (<View style={styles.bottomCardContainer}>
                        <CustomButton text="continue" onPress={_handleAddEventContinue}/>
                    </View>)}

                    {currentModalStep !== 1 && currentModalStep !== 3 && (
                        <View style={styles.bottomRowContainer}>
                            <CustomButton text="Back" onPress={_handleAddEventBack} style={styles.backButton}
                                          textStyle={styles.buttonText}/>
                            <CustomButton text="Continue" onPress={_handleAddEventContinue}
                                          style={styles.continueButton}/>
                        </View>
                    )}

                    {currentModalStep === 3 && (
                        <View style={styles.bottomRowContainer}>
                            <CustomButton text="Cancel" onPress={_handleCancelEventCreation} style={styles.backButton}
                                          textStyle={styles.buttonText}/>
                            <CustomButton text="Save" onPress={_handleAddEventContinue} style={styles.continueButton}/>
                        </View>
                    )}
                </Modal>
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
        },
        addEventModal: {
            backgroundColor: 'white',
            borderRadius: 20,
            paddingHorizontal: 5,
            width: '90%',
            height: '80%',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'flex-start',
            marginTop: 10,
        },
        addEventModalFormContainer: {
            width: '95%',
            height: '70%',
            marginTop: 30,
        },
        textLabel: {
            fontSize: 14,
            fontWeight: 'bold',
            color: 'black',
            marginBottom: 5,
            marginLeft: 10,
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
            width: '100%',
            alignItems: 'center',
        },
        bottomRowContainer: {
            position: 'absolute',
            bottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-around',
        },
        backButton: {
            backgroundColor: 'white',
            borderColor: '#2757CB',
            borderWidth: 1,
            width: wp(40),
            height: 50,
            borderRadius: 22,

        },
        continueButton: {
            backgroundColor: "#2757CB",
            width: wp(40),
            height: 50,
            borderRadius: 22,
            alignSelf: "center",
            justifyContent: "center",
        },
        buttonText: {
            fontSize: 20,
            color: '#2757CB',
            textAlign: 'center'
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '50%'
        },
        text: {
            fontSize: 16,
            marginLeft: 15,
        }


    }
);
export default Calendar;