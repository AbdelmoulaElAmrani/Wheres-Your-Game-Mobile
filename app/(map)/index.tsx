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
    const [selectedLocation, setSelectedLocation] = useState<TrainingLocation | null>(null);

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
            const locations = await TrainingLocationService.getTrainingLocationsMap();

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

    const handleLocationSelect = (location: TrainingLocation) => {
        setSelectedLocation(location);
        setIsListVisible(true);
        mapRef.current?.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        }, 1000);
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar style={"dark"}/>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={_onGoBack}>
                    <Ionicons name="chevron-back" size={35} color="white"/>
                </TouchableOpacity>
                <Text style={styles.headerText}>Map View</Text>
                <TouchableOpacity onPress={_openModal}>
                    <Ionicons name="filter-sharp" size={35} color="white"/>
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
                                radius={filter.radius * 1609.34}
                                strokeColor="rgba(39, 87, 203, 0.5)"
                                fillColor="rgba(39, 87, 203, 0.2)"
                            />
                        )}
                        
                        {trainingLocations.map((location) => (
                            <Marker
                                key={location.id}
                                coordinate={{
                                    latitude: location.latitude,
                                    longitude: location.longitude
                                }}
                                anchor={{ x: 0.5, y: 1.0 }}
                                onPress={() => handleLocationSelect(location)}
                            >
                                <Image 
                                    source={require('../../assets/images/pin.png')}
                                    style={styles.markerImage}
                                />
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
                                        style={[
                                            styles.listItem,
                                            selectedLocation?.id === location.id && styles.selectedListItem,
                                            selectedLocation?.id === location.id && styles.lastListItem
                                        ]}
                                        onPress={() => handleLocationSelect(location)}>
                                        <View style={styles.listItemContent}>
                                            <Text style={styles.listItemTitle}>{location.name}</Text>
                                            <Text style={styles.listItemAddress}>{location.address}</Text>
                                            <Text style={styles.listItemSport}>Sport: {location.sport.name}</Text>
                                            
                                            {selectedLocation?.id === location.id && (
                                                <View style={styles.listItemActions}>
                                                    <TouchableOpacity 
                                                        style={styles.listActionButton}
                                                        onPress={() => {
                                                            Clipboard.setString(location.address);
                                                            Alert.alert('Success', 'Address copied to clipboard');
                                                        }}>
                                                        <Ionicons name="copy-outline" size={20} color="#2757CB" />
                                                        <Text style={styles.listActionButtonText}>Copy Address</Text>
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={styles.listActionButton}
                                                        onPress={() => {
                                                            router.push({
                                                                pathname: '/UserConversation',
                                                                params: {receptionId: location.createdBy},
                                                            });
                                                        }}>
                                                        <Ionicons name="chatbubble-outline" size={20} color="#2757CB" />
                                                        <Text style={styles.listActionButtonText}>Message</Text>
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={styles.listActionButton}
                                                        onPress={() => {
                                                            router.push({
                                                                pathname: '/(user)/UserProfile',
                                                                params: {userId: location.createdBy},
                                                            });
                                                        }}>
                                                        <Ionicons name="person-outline" size={20} color="#2757CB" />
                                                        <Text style={styles.listActionButtonText}>View Profile</Text>
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={styles.listActionButton}
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
                                                        <Text style={styles.listActionButtonText}>Get Directions</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity onPress={() => {
                                            if (selectedLocation?.id === location.id) {
                                                setSelectedLocation(null);
                                            } else {
                                                handleLocationSelect(location);
                                            }
                                        }}>
                                            <Ionicons 
                                                name={selectedLocation?.id === location.id ? "chevron-down" : "chevron-forward"} 
                                                size={24} 
                                                color="#666" 
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <View style={styles.listGradientOverlay}></View>
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
        zIndex: 1,
        backgroundColor: '#2757CB'
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
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
    listContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: hp('40%'),
    },
    listScrollView: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 20,
    },
    listGradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    listItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectedListItem: {
        borderColor: '#2757CB',
        backgroundColor: '#F8F9FA',
    },
    lastListItem: {
        marginBottom: 40,
    },
    listItemContent: {
        flex: 1,
        marginRight: 12,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    listItemAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    listItemSport: {
        fontSize: 14,
        color: '#2757CB',
        fontWeight: '500',
    },
    listItemActions: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    listActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F0FE',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    listActionButtonText: {
        color: '#2757CB',
        fontSize: 14,
        fontWeight: '500',
    },
    listToggleButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#2757CB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    listToggleText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
export default SportMap;