import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal as RNModal} from "react-native";
import {StatusBar} from "expo-status-bar";
import {
    heightPercentageToDP,
    heightPercentageToDP as hp,
    widthPercentageToDP as wp
} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {memo, useCallback, useState, useEffect, useMemo} from "react";
import {Image, ImageBackground} from "expo-image";
import ReactNativeCalendarStrip from "react-native-calendar-strip";
import moment from "moment";
import {AntDesign, Entypo, Octicons} from "@expo/vector-icons";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {FlashList} from "@shopify/flash-list";
import {ActivityIndicator, MD2Colors, Modal, TextInput} from "react-native-paper";
import {DatePickerModal, enGB, registerTranslation, TimePickerModal} from 'react-native-paper-dates';
import CustomButton from "@/components/CustomButton";
import RNPickerSelect from 'react-native-picker-select';
import SportLevel from "@/models/SportLevel";
import Checkbox from "expo-checkbox";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {EventService} from "@/services/EventService";
import {SportEvent} from "@/models/SportEvent";
import {SportEventRequest} from "@/models/requestObjects/SportEventRequest";
import {useFocusEffect, useNavigation} from "expo-router";
import StyledAlert from "@/components/StyledAlert";
import { useAlert } from "@/utils/useAlert";
import { UserSportResponse } from "@/models/responseObjects/UserSportResponse";

import { GOOGLE_PLACES_API_KEY } from "@/config/apiKeys";

interface CheckboxProps {
    title: string;
    isChecked: boolean;
    onPress: () => void;
}


const Calendar = () => {
    const user = useSelector((state: any) => state.user.userData) as UserResponse;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const today = moment();
    const [selectedDate, setSelectedDate] = useState<moment.Moment>(today);
    const minDate = today.clone().add(12, 'months').toDate();
    const maxDate = today.clone().subtract(12, 'months').toDate();
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
    //const [eventDate, setEventDate] = useState<Date | null>(null);

    const [event, setEvent] = useState<any>({
        name: '',
        date: new Date(),
        time: '',
        eventTypes: [],
        levelsOfPlay: [],
        ageGroups: [], // Changed to empty array for checkboxes
        ageAll: false,
        id: 0,
        description: '',
        address: '',
        latitude: 0,
        longitude: 0
    });
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
        {title: 'Match', isChecked: false}
    ]);
    const [ageGroupOptions, setAgeGroupOptions] = useState([
        {title: 'All', isChecked: false},
        {title: 'U-6', isChecked: false},
        {title: 'U-7', isChecked: false},
        {title: 'U-8', isChecked: false},
        {title: 'U-9', isChecked: false},
        {title: 'U-10', isChecked: false},
        {title: 'U-11', isChecked: false},
        {title: 'U-12', isChecked: false},
        {title: 'U-13', isChecked: false},
        {title: 'U-14', isChecked: false},
        {title: 'U-15', isChecked: false},
        {title: 'U-16', isChecked: false},
        {title: 'U-17', isChecked: false},
        {title: 'U-18', isChecked: false},
        {title: 'Senior', isChecked: false}
    ]);
    const isFocus = useNavigation().isFocused();

    const { showErrorAlert, showStyledAlert, alertConfig, closeAlert } = useAlert();

    useFocusEffect(useCallback(() => {
        if (user?.id) {
            if (user.role == UserType[UserType.COACH] || user.role == UserType[UserType.ORGANIZATION]) {
                getCoachEvents();
            } else {
                getUserEvents();
            }
        }
    }, [selectedDate, user.id]))

    const [selectedSportLevel, setSelectedSportLevel] = useState<string[]>([]);
    registerTranslation("en", enGB);
    const [events, setEvents] = useState<SportEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const sportLevels = Object.keys(SportLevel).filter((key: string) => !isNaN(Number(SportLevel[key as keyof typeof SportLevel])));
    sportLevels.push('All');


    const getCoachEvents = async () => {
        try {
            setIsLoaded(true);
            const data = await EventService.getEvents(user.id, selectedDate.format('YYYY-MM-DDT00:00:00'), 0, 100, '');
            if (data?.content) {
                setEvents(data.content);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoaded(false);
        }
    }

    const getUserEvents = async () => {
        try {
            setIsLoaded(true);
            const events = await EventService.getEvents(user.id, selectedDate.format('YYYY-MM-DDT00:00:00'), 0, 100, '');
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
    }

    function _onEditEvent(item: any): void {
        setEditMode(true);
        setEvent({
            ...event,
            name: item?.name,
            eventTypes: item?.eventTypes || [],
            date: new Date(item?.eventDate),
            time: item?.time,
            id: item?.id,
            description: item?.description,
            ageGroups: item?.ageGroups || [],
            address: item?.address || '',
            latitude: item?.latitude || 0,
            longitude: item?.longitude || 0
        });
        setOptions(options.map(option => ({
            ...option,
            isChecked: item?.eventTypes ? item.eventTypes.includes(option.title) : false
        })));
        setAgeGroupOptions(ageGroupOptions.map(option => ({
            ...option,
            isChecked: item?.ageGroups ? item.ageGroups.includes(option.title) : false
        })));
        setSelectedSportLevel(item?.levelsOfPlay || []);
        if (item.eventDate) {
            const eventMoment = moment(item.eventDate);
            setTime({hours: eventMoment.hours(), minutes: eventMoment.minutes()});
        }
        // Set selected result if address exists
        if (item?.address) {
            setSelectedResult({
                formatted_address: item.address,
                place_id: 'existing'
            });
        } else {
            setSelectedResult(null);
        }
        setSearchResults([]);
        setIsModalVisible(true);
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
            setEvent((prev: any) => ({...prev, time: params.hours + ':' + params.minutes}));
        },
        [setTimeOpen]
    );

    const _verifyEvent = (step?: number) => {
        const errorMessages = [];
        if (step === 1 && (!event.name.trim() || event.name.length < 3)) {
            errorMessages.push('Event name is required and must be at least 3 characters');
        }
        if (step === 2 && options.filter(option => option.isChecked).length === 0) {
            errorMessages.push('Event type is required');
        }
        if (step === 3 && ageGroupOptions.filter(option => option.isChecked).length === 0) {
            errorMessages.push('Age groups are required');
        }
        if (step === 4 && selectedSportLevel.length === 0) {
            errorMessages.push('Level of play is required');
        }
        if (errorMessages.length > 0) {
            showErrorAlert(errorMessages.join('\n'), closeAlert);
            return false;
        }
    }


    const _createEvent = async () => {
        if (_verifyEvent() === false) return;
        try {
            // Combine date and time
            let eventDateTime = moment(event.date);
            if (event.time) {
                const [hours, minutes] = event.time.split(':');
                eventDateTime = eventDateTime.hours(parseInt(hours)).minutes(parseInt(minutes));
            }
            // Gather selected event types
            const selectedEventTypes = event.eventTypes || [];
            // Gather selected age groups from checkboxes
            const ageGroups = event.ageGroups || [];
            var createdEvent = await EventService.createEvent({
                name: event.name,
                description: event.description,
                ownerId: user.id,
                zipCode: event.zipCode || '',
                eventDate: eventDateTime.format('YYYY-MM-DDTHH:mm:ss'),
                ageGroups: ageGroups,
                eventTypes: selectedEventTypes,
                levelsOfPlay: selectedSportLevel,
                address: event.address,
                latitude: event.latitude,
                longitude: event.longitude
            } as SportEventRequest);

            if (createdEvent) {
                setEvents([...events, createdEvent]);
                setSelectedSportLevel([]);
                setEvent({name: '', date: new Date(), time: '', type: [], level: [], ageGroups: [], eventTypes: [], ageAll: false, address: '', latitude: 0, longitude: 0});
                setOptions(options.map(option => ({...option, isChecked: false})));
                setAgeGroupOptions(ageGroupOptions.map(option => ({...option, isChecked: false})));
                setSelectedResult(null);
                setSearchResults([]);
            }
        } catch (error) {
            console.log(error);
        }
    }


    const _editEvent = async () => {
        try {
            let eventDateTime = moment(event.date);
            if (event.time) {
                const [hours, minutes] = event.time.split(':');
                eventDateTime = eventDateTime.hours(parseInt(hours)).minutes(parseInt(minutes));
            }
            const selectedEventTypes = event.eventTypes || [];
            const ageGroups = event.ageGroups || [];
            var updatedEvent = await EventService.editeEvent({
                id: event.id,
                name: event.name,
                description: event.description,
                zipCode: event.zipCode,
                ownerId: user.id,
                eventDate: eventDateTime.format('YYYY-MM-DDTHH:mm:ss'),
                ageGroups: ageGroups,
                eventTypes: selectedEventTypes,
                levelsOfPlay: selectedSportLevel,
                address: event.address,
                latitude: event.latitude,
                longitude: event.longitude
            });
            return updatedEvent;
        } catch (error) {
            console.log(error);
        }
    }

    const _handleAddEventContinue = async () => {
        const defaultStep = currentModalStep
        setCurrentModalStep(old => Math.min(4, old + 1));
        if (_verifyEvent(currentModalStep) === false) {
            setCurrentModalStep(defaultStep);
            return;
        }
        
        if (currentModalStep === 4) {
            if (editMode) {
                var updatedEvent = await _editEvent();
                if(updatedEvent) {
                setEvents(oldEvents => {
                    const updatedIndex = oldEvents.findIndex(event => event.id === updatedEvent.id);
                    if (updatedIndex !== -1) {
                        const updatedEvents = [...oldEvents];
                        updatedEvents[updatedIndex] = updatedEvent;
                        return updatedEvents;
                    } else {
                            return oldEvents;
                        }
                    });
                }
            } else {
                // TODO:: Create
                await _createEvent();
            }
            _handleCancelEventCreation();
        }
    }

    const _handleAddEventBack = () => {
        setCurrentModalStep(old => Math.max(1, old - 1));
    }

    const _handleCancelEventCreation = () => {
        hideModal();
        setSelectedSportLevel([]);
        setOptions(options.map(option => ({...option, isChecked: false})));
        setCurrentModalStep(1);
        setEvent({name: '', date: new Date(), time: '', type: [], level: [], ageGroups: [], eventTypes: [], ageAll: false, address: '', latitude: 0, longitude: 0});
        setOpen(false);
        //setEventDate(null);
        setTimeOpen(false);
        setEditMode(false);
        setSelectedResult(null);
        setSearchResults([]);
    }

    const _handlePress = (index: number) => {
        const newOptions = [...options];
        newOptions[index].isChecked = !newOptions[index].isChecked;
        setOptions(newOptions);
        
        const selectedEventTypes = newOptions.filter(option => option.isChecked).map(option => option.title);
        setEvent((prev: any) => ({ ...prev, eventTypes: selectedEventTypes }));
    };

    const _handleAgeGroupPress = (index: number) => {
        const newAgeGroupOptions = [...ageGroupOptions];
        
        if (newAgeGroupOptions[index].title === 'All') {
            // Handle All
            const isAllSelected = newAgeGroupOptions[index].isChecked;
            newAgeGroupOptions.forEach((option, i) => {
                if (i === 0) { // All checkbox
                    newAgeGroupOptions[i].isChecked = !isAllSelected;
                } else { // All other age groups
                    newAgeGroupOptions[i].isChecked = !isAllSelected;
                }
            });
        } else {
            // Handle individual age group selection
            newAgeGroupOptions[index].isChecked = !newAgeGroupOptions[index].isChecked;
            
            // Update All based on other selections
            const otherSelections = newAgeGroupOptions.slice(1).filter(option => option.isChecked);
            newAgeGroupOptions[0].isChecked = otherSelections.length === newAgeGroupOptions.length - 1;
        }
        
        setAgeGroupOptions(newAgeGroupOptions);
        
        const selectedAgeGroups = newAgeGroupOptions.filter(option => option.isChecked && option.title !== 'All').map(option => option.title);
        setEvent((prev: any) => ({ ...prev, ageGroups: selectedAgeGroups }));
    };

    const CustomCheckbox = ({title, isChecked, onPress}: CheckboxProps) => {
        return (
            <View style={styles.checkboxContainer}>
                <Checkbox
                    value={isChecked}
                    onValueChange={onPress}
                    color={isChecked ? '#2757CB' : 'black'}
                />
                <Text style={[styles.text, {fontSize: 13}]}>{title}</Text>
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

    const handleSearchAddress = async () => {
        if (!event.address) {
            showErrorAlert('Please enter an address to search', closeAlert);
            return;
        }
        setIsVerifying(true);
        setSearchResults([]);
        setSelectedResult(null);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(event.address)}&key=${GOOGLE_PLACES_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                setSearchResults(data.results);
                
                // If there's only one result, automatically select it
                if (data.results.length === 1) {
                    handleSelectResult(data.results[0]);
                }
            } else {
                showErrorAlert('No address found. Please try again.', closeAlert);
            }
        } catch (error) {
            showErrorAlert('Failed to search address', closeAlert);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSelectResult = (result: any) => {
        setSelectedResult(result);
        setEvent({
            ...event,
            address: result.formatted_address,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng
        });
    };

    const _renderEvent = memo(({item}: { item: SportEvent }) => {
        const sport = userSport.find(sport => sport.sportId === item.sportId);
        return (
            <TouchableOpacity
                onPress={() => _onClickEvent(item)}
                disabled={isCoach()}
                style={styles.eventContainer}>
                <View style={{flex: 0.25, justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={{uri: sport?.iconUrl}}
                        style={{width: 40, height: 40}}
                        placeholder={require('../../assets/images/sport/sport.png')}
                    />
                </View>
                <View style={{flex:1, paddingHorizontal: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 0.7}}>
                        <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.name}</Text>
                        {isCoach() &&
                            <Octicons onPress={() => _onEditEvent(item)} name="pencil" size={24} color="grey"/>}
                    </View>
                    <Text style={{color: 'grey', flex: 0.3}} numberOfLines={1} ellipsizeMode="tail">
                        {isCoach() ? moment(item.eventDate).format('YYYY-MM-DD hh:mm A') : 
                          `${sport ? sport.sportName : 'Unknown Sport'} | ${moment(item.eventDate).format('YYYY-MM-DD hh:mm A')}`}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    });

    const isCoach = (): boolean => user?.role == UserType[UserType.COACH] || user?.role == UserType[UserType.ORGANIZATION];

    const getTitle = (): string => {
        if (isCoach())
            return `All Events for ${selectedDate.format('YYYY-MM-DD')}`;
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

    const [isVerifying, setIsVerifying] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResult, setSelectedResult] = useState<any | null>(null);

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
                                <View style={styles.inputContainer}>
                                    <View style={styles.iconContainer}>
                                        <AntDesign name="calendar" size={20} color="#D3D3D3"/>
                                    </View>
                                    <TextInput
                                        style={styles.inputStyleWithoutIcon}
                                        placeholder={'Date of Event'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        value={event?.date.toDateString()}
                                        onFocus={() => setOpen(true)}
                                        underlineColor={"transparent"}
                                    />
                                </View>
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
                                <View style={styles.inputContainer}>
                                    <View style={styles.iconContainer}>
                                        <AntDesign name="clockcircle" size={20} color="#D3D3D3"/>
                                    </View>
                                    <TextInput
                                        style={styles.inputStyleWithoutIcon}
                                        placeholder={'Time of Event'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        value={moment({ hour: time.hours, minute: time.minutes }).format('hh:mm A')}
                                        onFocus={() => setTimeOpen(true)}
                                        underlineColor={"transparent"}
                                    />
                                </View>

                                <Text style={[styles.textLabel, {marginTop: 20}]}>Event Name</Text>
                                <View style={styles.inputContainer}>
                                    <View style={styles.iconContainer}>
                                        <AntDesign name="star" size={20} color="#D3D3D3"/>
                                    </View>
                                    <TextInput
                                        style={styles.inputStyleWithoutIcon}
                                        placeholder={'Event Name'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        underlineColor={"transparent"}
                                        value={event.name}
                                        onChangeText={(text) => setEvent({...event, name: text})}
                                    />
                                </View>
                                <Text style={[styles.textLabel, {marginTop: 20}]}>Event Description</Text>
                                <View style={styles.inputContainer}>
                                    <View style={styles.iconContainer}>
                                        <AntDesign name="star" size={20} color="#D3D3D3"/>
                                    </View>
                                    <TextInput
                                        style={styles.inputStyleWithoutIcon}
                                        placeholder={'Event Description'}
                                        cursorColor='black'
                                        placeholderTextColor={'grey'}
                                        underlineColor={"transparent"}
                                        value={event.description}
                                        onChangeText={(text) => setEvent({...event, description: text})}
                                    />
                                </View>
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
                                                marginBottom: 30,
                                                paddingHorizontal: 10
                                            }}>
                                                <View style={{flex: 1, marginRight: 5}}>
                                                    <CustomCheckbox
                                                        title={options[index].title}
                                                        isChecked={options[index].isChecked}
                                                        onPress={() => _handlePress(index)}
                                                    />
                                                </View>
                                                {options[index + 1] ? (
                                                    <View style={{flex: 1, marginHorizontal: 5}}>
                                                        <CustomCheckbox
                                                            title={options[index + 1].title}
                                                            isChecked={options[index + 1].isChecked}
                                                            onPress={() => _handlePress(index + 1)}
                                                        />
                                                    </View>
                                                ) : <View style={{flex: 1}} />}
                                                
                                            </View>
                                        )
                                    ))}
                                </View>
                            </ScrollView>
                        )}

                        {currentModalStep === 3 && (
                            <ScrollView contentContainerStyle={{paddingHorizontal: 20}}>
                                <Text style={[styles.textLabel, {marginBottom: 20, textAlign: 'center', fontSize: 16}]}>Age Group</Text>
                                <View style={{marginTop: 30}}>
                                    {ageGroupOptions.map((option, index) => (
                                        index % 3 === 0 && (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginBottom: 30,
                                                paddingHorizontal: 10
                                            }}>
                                                <View style={{flex: 1, marginRight: 5}}>
                                                    <CustomCheckbox
                                                        title={ageGroupOptions[index].title}
                                                        isChecked={ageGroupOptions[index].isChecked}
                                                        onPress={() => _handleAgeGroupPress(index)}
                                                    />
                                                </View>
                                                {ageGroupOptions[index + 1] ? (
                                                    <View style={{flex: 1, marginHorizontal: 5}}>
                                                        <CustomCheckbox
                                                            title={ageGroupOptions[index + 1].title}
                                                            isChecked={ageGroupOptions[index + 1].isChecked}
                                                            onPress={() => _handleAgeGroupPress(index + 1)}
                                                        />
                                                    </View>
                                                ) : <View style={{flex: 1}} />}
                                                {ageGroupOptions[index + 2] ? (
                                                    <View style={{flex: 1, marginLeft: 5}}>
                                                        <CustomCheckbox
                                                            title={ageGroupOptions[index + 2].title}
                                                            isChecked={ageGroupOptions[index + 2].isChecked}
                                                            onPress={() => _handleAgeGroupPress(index + 2)}
                                                        />
                                                    </View>
                                                ) : <View style={{flex: 1}} />}
                                            </View>
                                        )
                                    ))}
                                </View>
                                
                               
                            </ScrollView>
                        )}
                         {currentModalStep === 4 && (
                            <ScrollView contentContainerStyle={{paddingHorizontal: 20}}>
                                
                                <Text style={[styles.textLabel, {marginTop: 20, marginBottom: 20, textAlign: 'center', fontSize: 16}]}>Level of Play</Text>
                                <View style={{marginTop: 30}}>
                                    {sportLevels.map((key: string, index) => (
                                        index % 2 === 0 && (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginBottom: 30,
                                                paddingHorizontal: 10
                                            }}>
                                                <View style={{flex: 1, marginRight: 5}}>
                                                    <CustomCheckbox
                                                        key={index}
                                                        title={sportLevels[index]}
                                                        isChecked={selectedSportLevel.includes(sportLevels[index])}
                                                        onPress={() => _handleLevelPress(index)}
                                                    />
                                                </View>
                                                {sportLevels[index + 1] ? (
                                                    <View style={{flex: 1, marginHorizontal: 5}}>
                                                        <CustomCheckbox
                                                            key={index + 1}
                                                            title={sportLevels[index + 1]}
                                                            isChecked={selectedSportLevel.includes(sportLevels[index + 1])}
                                                            onPress={() => _handleLevelPress(index + 1)}
                                                        />
                                                    </View>
                                                ) : <View style={{flex: 1}} />}
                                            </View>
                                        )
                                    ))}
                                </View>

                                <Text style={[styles.textLabel, {marginTop: 20, marginBottom: 20, textAlign: 'center', fontSize: 16}]}>Event Location</Text>
                                {!selectedResult && (
                                    <View style={styles.inputContainer}>
                                        <View style={styles.iconContainer}>
                                            <AntDesign name="enviromento" size={20} color="#D3D3D3"/>
                                        </View>
                                        <TextInput
                                            style={styles.inputStyleWithoutIcon}
                                            placeholder="Enter event address"
                                            cursorColor='black'
                                            placeholderTextColor={'grey'}
                                            underlineColor={"transparent"}
                                            value={event.address}
                                            onChangeText={(text) => {
                                                setEvent({...event, address: text});
                                                setSelectedResult(null);
                                                setSearchResults([]);
                                            }}
                                        />
                                    </View>
                                )}
                                {!selectedResult && (
                                    <TouchableOpacity
                                        style={[styles.modalAddButton, styles.searchButton, isVerifying && styles.disabledButton]}
                                        onPress={handleSearchAddress}
                                        disabled={isVerifying}
                                    >
                                        {isVerifying ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text style={styles.modalAddButtonText}>Verify Address</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                                {selectedResult && (
                                    <View style={styles.selectedAddressContainer}>
                                        {/* <Text style={styles.selectedAddressLabel}>Selected Address:</Text> */}
                                        
                                        {/* <Text style={styles.selectedAddressText}>{selectedResult.formatted_address}</Text> */}
                                        <TouchableOpacity
                                            style={styles.changeAddressButton}
                                            onPress={() => {
                                                setSelectedResult(null);
                                                setSearchResults([]);
                                            }}
                                        >
                                            <Text style={styles.changeAddressButtonText}>{selectedResult.formatted_address}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {searchResults.length > 1 && !selectedResult && (
                                    <View style={styles.multipleResultsContainer}>
                                        <Text style={styles.multipleResultsLabel}>Select an address from the following list:</Text>
                                        <View style={styles.resultsList}>
                                            {searchResults.map((item) => (
                                                <TouchableOpacity
                                                    key={item.place_id}
                                                    style={[styles.resultItem, selectedResult?.place_id === item.place_id && styles.selectedResultItem]}
                                                    onPress={() => handleSelectResult(item)}
                                                >
                                                    <Text style={styles.resultText}>{item.formatted_address}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>

                    {currentModalStep === 1 && (
                        <View style={styles.bottomRowContainer}>
                        <CustomButton text="Cancel" onPress={_handleCancelEventCreation} style={styles.backButton}
                                          textStyle={styles.buttonText}/>      
                        <CustomButton text="Continue"style={styles.continueButton} onPress={_handleAddEventContinue}/>
                        </View>
                    )}

                    {currentModalStep !== 1 && currentModalStep !== 4 && (
                        <View style={styles.bottomRowContainer}>
                            <CustomButton text="Back" onPress={_handleAddEventBack} style={styles.backButton}
                                          textStyle={styles.buttonText}/>
                            <CustomButton text="Continue" onPress={_handleAddEventContinue}
                                          style={styles.continueButton}/>
                        </View>
                    )}

                    {currentModalStep === 4 && (
                        <View style={styles.bottomRowContainer}>
                            <CustomButton text="Back" onPress={_handleAddEventBack} style={styles.backButton}
                                          textStyle={styles.buttonText}/>
                            <CustomButton text="Save" onPress={_handleAddEventContinue} style={styles.continueButton}/>
                        </View>
                    )}
                </Modal>
            </SafeAreaView>
            
            {/* Custom Styled Alert for Android */}
            <StyledAlert
                visible={showStyledAlert}
                config={alertConfig}
                onClose={closeAlert}
            />
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
            width: '100%'
        },
        text: {
            fontSize: 13,
            marginLeft: 8,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#D3D3D3',
            borderRadius: 20,
            padding: 10,
            marginBottom: 10,
        },
        iconContainer: {
            marginRight: 10,
        },
        inputStyleWithoutIcon: {
            flex: 1,
            backgroundColor: 'white',
            height: 45,
            fontSize: 16,
            color: 'black',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
            padding: 0,
        },
        modalAddButton: {
            backgroundColor: '#2757CB',
            padding: 15,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalAddButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'white',
        },
        selectedAddressContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderWidth: 1,
            borderColor: '#D3D3D3',
            borderRadius: 10,
        },
        selectedAddressLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'black',
            marginRight: 10,
        },
        selectedAddressText: {
            fontSize: 16,
            color: 'black',
        },
        changeAddressButton: {
            backgroundColor: '#2757CB',
            padding: 10,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        changeAddressButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'white',
        },
        multipleResultsContainer: {
            padding: 10,
            borderWidth: 1,
            borderColor: '#D3D3D3',
            borderRadius: 10,
        },
        multipleResultsLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'black',
            marginBottom: 10,
        },
        resultsList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        resultItem: {
            padding: 10,
            borderWidth: 1,
            borderColor: '#D3D3D3',
            borderRadius: 10,
            margin: 5,
        },
        selectedResultItem: {
            backgroundColor: '#E15B2D',
        },
        resultText: {
            fontSize: 16,
            color: 'black',
        },
        searchButton: {
            marginTop: 10,
            marginBottom: 10,
        },
        disabledButton: {
            backgroundColor: '#D3D3D3',
        },
    }
);
export default Calendar;