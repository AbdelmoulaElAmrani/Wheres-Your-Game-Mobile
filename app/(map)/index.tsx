import {Alert, Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image, Linking, Clipboard} from "react-native";
import MapView, {PROVIDER_GOOGLE, Circle, Marker, Callout} from "react-native-maps";
import {StatusBar} from "expo-status-bar";
import React, {useEffect, useRef, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import {useDispatch, useSelector} from "react-redux";
import {List, RadioButton} from "react-native-paper";
import Checkbox from "expo-checkbox";
import * as Location from 'expo-location';
import {getSports} from "@/redux/SportSlice";
import { TrainingLocationService } from "@/services/TrainingLocationService";
import { TrainingLocation } from "@/models/TrainingLocation";

enum Filters {
    SPORT,
    RADIUS
}

interface RadioBoxFilter {
    id: string;
    value: string;
}

interface FilterState {
    sports: RadioBoxFilter[];
    radius: number;
}

const radiusOptions = [
    { id: '1', value: '1 mile' },
    { id: '5', value: '5 miles' },
    { id: '10', value: '10 miles' },
    { id: '20', value: '20 miles' },
    { id: '50', value: '50 miles' }
] as RadioBoxFilter[];

const SportMap = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const availableSports = useSelector((state: any) => state.sport.evalbleSports).map((sport: any) => ({
        id: sport.id,
        value: sport.name
    })) as RadioBoxFilter[];
    const [expandedFilter, setExpandedFilter] = useState<Filters | undefined>(Filters.SPORT);
    const [filter, setFilter] = useState<FilterState>({
        sports: [],
        radius: 5 // Default 5km radius
    });
    const [region, setRegion] = useState<any>(null);
    const mapRef = useRef<MapView>(null);
    const dispatch = useDispatch();
    const [trainingLocations, setTrainingLocations] = useState<TrainingLocation[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(false);
    const [isListVisible, setIsListVisible] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                let {status} = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    setHasLocationPermission(true);
                    let location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High
                    });
                    setUserLocation(location);
                    
                    // Calculate the region to show city-level view
                    const latitudeDelta = 0.02;
                    const longitudeDelta = 0.02;
                    
                    const newRegion = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta,
                        longitudeDelta
                    };
                    
                    setRegion(newRegion);
                    mapRef.current?.animateToRegion(newRegion, 1000);
                } else {
                    setHasLocationPermission(false);
                    Alert.alert(
                        'Location Permission',
                        'Please enable location services to see nearby events and training locations.',
                        [{ text: 'OK' }]
                    );
                }
            } catch (error) {
                console.error('Error getting location:', error);
                setHasLocationPermission(false);
            } finally {
                setIsLoading(false);
            }
            
            if (availableSports.length == 0) {
                await dispatch(getSports() as any);
            }
        })();
    }, []);

    const _onGoBack = () => {
        if (router.canGoBack()) router.back();
    }

    const _hideModal = () => setModalVisible(false);
    const _openModal = () => setModalVisible(true);

    const _handleSelectedFilter = (filter: Filters) => {
        setExpandedFilter(old => old !== filter ? filter : undefined);
    }

    const _handleSelectedSport = (item: RadioBoxFilter, value: boolean) => {
        setFilter(oldFilter => ({
            ...oldFilter,
            sports: value
                ? [...oldFilter.sports, item]
                : oldFilter.sports.filter(existingItem => existingItem.id !== item.id)
        }));
    }

    const _handleRadiusChange = (radius: number) => {
        setFilter(old => ({ ...old, radius }));
        if (userLocation) {
            const latitudeDelta = radius * 0.01; // Adjust zoom based on radius
            const longitudeDelta = radius * 0.01;
            const newRegion = {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta,
                longitudeDelta
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);
        }
    }

    // Function to load training locations
    const loadTrainingLocations = async () => {
        if (!userLocation) return;
        
        try {
            setIsLoadingLocations(true);
            const locations = await TrainingLocationService.getTrainingLocations();
            if (locations) {
                // Filter locations based on selected sports and radius
                const filteredLocations = locations.filter(location => {
                    // Check if location's sport is in selected sports
                    const sportMatch = filter.sports.length === 0 || 
                        filter.sports.some(sport => sport.id === location.sport.id);
                    
                    if (!sportMatch) return false;
                    
                    // Calculate distance from user location
                    const distance = calculateDistance(
                        userLocation.coords.latitude,
                        userLocation.coords.longitude,
                        location.latitude,
                        location.longitude
                    );
                    
                    // Check if within radius (in miles)
                    return distance <= filter.radius;
                });
                
                setTrainingLocations(filteredLocations);
            }
        } catch (error) {
            console.error('Error loading training locations:', error);
            Alert.alert('Error', 'Failed to load training locations');
        } finally {
            setIsLoadingLocations(false);
        }
    };

    // Function to calculate distance between two points using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 3958.8; // Earth's radius in miles
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in miles
    };

    // Load locations when filters change
    useEffect(() => {
        loadTrainingLocations();
    }, [filter, userLocation]);

    const _applyFilters = () => {
        loadTrainingLocations();
        setModalVisible(false);
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar style={"dark"}/>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={_onGoBack}>
                    <Ionicons name="chevron-back" size={35} color="black"/>
                </TouchableOpacity>
                <Text style={styles.headerText}>Map View</Text>
                <TouchableOpacity onPress={_openModal}>
                    <Ionicons name="filter-sharp" size={35} color="black"/>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2757CB" />
                    <Text style={styles.loadingText}>Getting your location...</Text>
                </View>
            ) : (
                <View style={{flex: 1}}>
                    <MapView
                        ref={mapRef}
                        initialRegion={region}
                        region={region}
                        showsUserLocation={hasLocationPermission}
                        onPress={Keyboard.dismiss}
                        provider={PROVIDER_GOOGLE}
                        style={StyleSheet.absoluteFill}>
                        {hasLocationPermission && userLocation && (
                            <Circle
                                center={{
                                    latitude: userLocation.coords.latitude,
                                    longitude: userLocation.coords.longitude
                                }}
                                radius={filter.radius * 1609.34} // Convert miles to meters for the map
                                strokeColor="rgba(39, 87, 203, 0.5)"
                                fillColor="rgba(39, 87, 203, 0.2)"
                            />
                        )}
                        
                        {/* Training Location Markers */}
                        {trainingLocations.map((location) => (
                            <Marker
                                key={location.id}
                                coordinate={{
                                    latitude: location.latitude,
                                    longitude: location.longitude
                                }}
                                anchor={{ x: 0.5, y: 1.0 }}
                            >
                                <Image 
                                    source={require('../../assets/images/pin.png')}
                                    style={styles.markerImage}
                                />
                                <Callout tooltip>
                                    <View style={styles.calloutContainer}>
                                        <Text style={styles.calloutTitle}>{location.name}</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                Clipboard.setString(location.address);
                                                Alert.alert('Success', 'Address copied to clipboard');
                                            }}>
                                            <Text style={styles.calloutText}>{location.address}</Text>
                                        </TouchableOpacity>
                                        <View style={styles.calloutButtons}>
                                            <TouchableOpacity 
                                                style={styles.calloutButton}
                                                onPress={() => {
                                                    // TODO: Navigate to location profile
                                                    console.log('View profile for:', location.id);
                                                }}>
                                                <Ionicons name="person-outline" size={20} color="#2757CB" />
                                                <Text style={styles.calloutButtonText}>View Profile</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={styles.calloutButton}
                                                onPress={() => {
                                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
                                                    Linking.canOpenURL(url).then(supported => {
                                                        if (supported) {
                                                            Linking.openURL(url);
                                                        } else {
                                                            Alert.alert('Error', 'Could not open maps application');
                                                        }
                                                    });
                                                }}>
                                                <Ionicons name="navigate-outline" size={20} color="#2757CB" />
                                                <Text style={styles.calloutButtonText}>Directions</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>

                    {/* List Toggle Button */}
                    <TouchableOpacity 
                        style={styles.listToggleButton}
                        onPress={() => setIsListVisible(!isListVisible)}>
                        <Ionicons 
                            name={isListVisible ? "chevron-down" : "chevron-up"} 
                            size={24} 
                            color="white" 
                        />
                        <Text style={styles.listToggleText}>
                            {isListVisible ? "Hide List" : `Show List (${trainingLocations.length})`}
                        </Text>
                    </TouchableOpacity>

                    {/* Collapsible List */}
                    {isListVisible && (
                        <View style={styles.listContainer}>
                            <ScrollView style={styles.listScrollView}>
                                {trainingLocations.map((location) => (
                                    <TouchableOpacity 
                                        key={location.id}
                                        style={styles.listItem}
                                        onPress={() => {
                                            mapRef.current?.animateToRegion({
                                                latitude: location.latitude,
                                                longitude: location.longitude,
                                                latitudeDelta: 0.01,
                                                longitudeDelta: 0.01
                                            }, 1000);
                                        }}>
                                        <View style={styles.listItemContent}>
                                            <Text style={styles.listItemTitle}>{location.name}</Text>
                                            <Text style={styles.listItemAddress}>{location.address}</Text>
                                            <Text style={styles.listItemSport}>Sport: {location.sport.name}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={24} color="#666" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            )}

            <Modal 
                backdropOpacity={0.5} 
                onDismiss={_hideModal} 
                isVisible={modalVisible}
                style={styles.modalStyle} 
                hideModalContentWhileAnimating={true}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionOutTiming={0}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View></View>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TouchableOpacity onPress={_hideModal}>
                            <AntDesign name="close" size={24} color="black"/>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.modalScrollView}>
                        <List.Section>
                            <List.Accordion 
                                titleStyle={{
                                    fontWeight: 'bold',
                                    color: expandedFilter == Filters.SPORT ? 'white' : 'black'
                                }}
                                style={[styles.dropDownContainer, {backgroundColor: expandedFilter == Filters.SPORT ? '#2757CB' : '#F8F9FA'}]}
                                expanded={expandedFilter == Filters.SPORT}
                                onPress={() => _handleSelectedFilter(Filters.SPORT)}
                                title="Sports">
                                <View style={styles.filterContent}>
                                    {availableSports.map((sport) => (
                                        <View key={sport.id} style={styles.filterItem}>
                                            <Checkbox
                                                style={styles.checkbox}
                                                value={filter.sports.some(x => x.id === sport.id)}
                                                onValueChange={(value) => _handleSelectedSport(sport, value)}
                                            />
                                            <Text style={styles.filterText}>{sport.value}</Text>
                                        </View>
                                    ))}
                                </View>
                            </List.Accordion>

                            <List.Accordion
                                titleStyle={{
                                    fontWeight: 'bold',
                                    color: expandedFilter == Filters.RADIUS ? 'white' : 'black'
                                }}
                                style={[styles.dropDownContainer, {backgroundColor: expandedFilter == Filters.RADIUS ? '#2757CB' : '#F8F9FA'}]}
                                expanded={expandedFilter == Filters.RADIUS}
                                onPress={() => _handleSelectedFilter(Filters.RADIUS)}
                                title="Radius">
                                <View style={styles.filterContent}>
                                    <View style={styles.radiusButtonsContainer}>
                                        {radiusOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option.id}
                                                style={[
                                                    styles.radiusButton,
                                                    filter.radius === parseInt(option.id) && styles.radiusButtonSelected
                                                ]}
                                                onPress={() => _handleRadiusChange(parseInt(option.id))}>
                                                <Text style={[
                                                    styles.radiusButtonText,
                                                    filter.radius === parseInt(option.id) && styles.radiusButtonTextSelected
                                                ]}>
                                                    {option.value}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </List.Accordion>
                        </List.Section>
                    </ScrollView>

                    <TouchableOpacity 
                        style={styles.applyButton}
                        onPress={_applyFilters}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        zIndex: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    modalStyle: {
        margin: 0,
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5'
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 18
    },
    modalScrollView: {
        maxHeight: 400
    },
    dropDownContainer: {
        marginHorizontal: 20,
        marginVertical: 5,
        borderRadius: 10
    },
    filterContent: {
        padding: 16,
    },
    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        borderRadius: 5,
        borderColor: 'black',
        marginRight: 10,
    },
    filterText: {
        fontSize: 16,
    },
    radiusButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    radiusButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        minWidth: 80,
        alignItems: 'center',
    },
    radiusButtonSelected: {
        backgroundColor: '#2757CB',
    },
    radiusButtonText: {
        color: '#333',
        fontSize: 14,
    },
    radiusButtonTextSelected: {
        color: 'white',
    },
    applyButton: {
        backgroundColor: '#2757CB',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        marginHorizontal: 20,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#2757CB',
    },
    markerImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    calloutContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        minWidth: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#2757CB'
    },
    calloutText: {
        fontSize: 14,
        color: '#2757CB',
        textDecorationLine: 'underline',
        marginBottom: 12,
    },
    calloutButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingTop: 12
    },
    calloutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 8,
        borderRadius: 6,
        flex: 1,
        marginHorizontal: 4,
        justifyContent: 'center'
    },
    calloutButtonText: {
        color: '#2757CB',
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500'
    },
    listToggleButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#2757CB',
        padding: 12,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    listToggleText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    listContainer: {
        position: 'absolute',
        bottom: 80,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        maxHeight: '50%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    listScrollView: {
        padding: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    listItemContent: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2757CB',
        marginBottom: 4,
    },
    listItemAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    listItemSport: {
        fontSize: 14,
        color: '#666',
    },
});
export default SportMap;