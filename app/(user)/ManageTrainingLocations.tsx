import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput, Keyboard, FlatList} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import { TrainingLocationService } from '@/services/TrainingLocationService';
import { TrainingLocation } from '@/models/TrainingLocation';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground } from 'expo-image';
import { List } from 'react-native-paper';
import { getUserSports } from '@/redux/UserSlice';
import { UserSportResponse } from '@/models/responseObjects/UserSportResponse';
import Requests from '@/services/Requests';

const GOOGLE_PLACES_API_KEY = "AIzaSyDlFo6upaajnGewXn4DX4-naBhsWPcn8VE";

const ManageTrainingLocations = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [locations, setLocations] = useState<TrainingLocation[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        sport: {
            id: '',
            name: ''
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResult, setSelectedResult] = useState<any | null>(null);
    const [editingLocation, setEditingLocation] = useState<TrainingLocation | null>(null);
    const [expandedSport, setExpandedSport] = useState(false);
    const user = useSelector((state: any) => state.user.userData);
    const userSports = useSelector((state: any) => state.user.userSport);

    useEffect(() => {
        loadLocations();
        if (user && user.id) {
            dispatch(getUserSports(user.id) as any);
        }
    }, [user]);

    // If user has only one sport, select it automatically
    useEffect(() => {
        if (userSports && userSports.length === 1) {
            const sport = userSports[0];
            setNewLocation(prev => ({
                ...prev,
                sport: {
                    id: sport.sportId,
                    name: sport.sportName
                }
            }));
        }
    }, [userSports]);

    const loadLocations = async () => {
        try {
            setIsLoading(true);
            const data = await TrainingLocationService.getTrainingLocations();
            if (data) {
                setLocations(data);
            }
        } catch (error) {
            console.error('Error loading locations:', error);
            Alert.alert('Error', 'Failed to load training locations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchAddress = async () => {
        if (!newLocation.address) {
            Alert.alert('Error', 'Please enter an address to search');
            return;
        }
        setIsVerifying(true);
        setSearchResults([]);
        setSelectedResult(null);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(newLocation.address)}&key=${GOOGLE_PLACES_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                setSearchResults(data.results);
            } else {
                Alert.alert('No results', 'No address found. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to search address');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSelectResult = (result: any) => {
        setSelectedResult(result);
        setNewLocation({
            ...newLocation,
            address: result.formatted_address,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng
        });
    };

    const handleAddLocation = async () => {
        if (!newLocation.name || !selectedResult || !newLocation.sport.id) {
            Alert.alert('Error', 'Please fill in all fields and select an address and sport');
            return;
        }

        console.log('Current newLocation state:', JSON.stringify(newLocation, null, 2));
        
        try {
            setIsLoading(true);
            const location = await TrainingLocationService.createTrainingLocation({
                name: newLocation.name,
                address: newLocation.address,
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                sport: {
                    id: newLocation.sport.id,
                    name: newLocation.sport.name
                },
                createdBy: user.id
            });
            if (location) {
                setLocations([...locations, location]);
                setModalVisible(false);
                setNewLocation({ 
                    name: '', 
                    address: '', 
                    latitude: 0, 
                    longitude: 0, 
                    sport: { id: '', name: '' } 
                });
                setSelectedResult(null);
                setSearchResults([]);
                Alert.alert('Success', 'Location added successfully');
            } else {
                Alert.alert('Error', 'No location returned from API');
            }
        } catch (error) {
            console.error('Error adding location:', error);
            Alert.alert('Error', 'Failed to add location');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLocation = async (id: string) => {
        Alert.alert(
            "Delete Location",
            "Are you sure you want to delete this location?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const success = await TrainingLocationService.deleteTrainingLocation(id);
                            if (success) {
                                setLocations(locations.filter(loc => loc.id !== id));
                                Alert.alert('Success', 'Location deleted successfully');
                            }
                        } catch (error) {
                            console.error('Error deleting location:', error);
                            Alert.alert('Error', 'Failed to delete location');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEditLocation = (location: TrainingLocation) => {
        console.log('Editing location:', JSON.stringify(location, null, 2));
        setEditingLocation(location);
        const sportData = {
            id: location.sport.id,
            name: location.sport.name
        };
        console.log('Setting sport data:', JSON.stringify(sportData, null, 2));
        setNewLocation({
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            sport: sportData
        });
        setSelectedResult({
            formatted_address: location.address,
            geometry: {
                location: {
                    lat: location.latitude,
                    lng: location.longitude
                }
            }
        });
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingLocation(null);
        setNewLocation({ 
            name: '', 
            address: '', 
            latitude: 0, 
            longitude: 0, 
            sport: { id: '', name: '' } 
        });
        setSelectedResult(null);
        setSearchResults([]);
    };

    const handleSaveEdit = async () => {
        if (!selectedResult || !editingLocation || !newLocation.sport.id) {
            Alert.alert('Error', 'Please select a valid address and sport');
            return;
        }

        try {
            setIsLoading(true);
            const updated = await TrainingLocationService.updateTrainingLocation(
                editingLocation.id,
                {
                    name: newLocation.name,
                    address: newLocation.address,
                    latitude: newLocation.latitude,
                    longitude: newLocation.longitude,
                    sport: {
                        id: newLocation.sport.id,
                        name: newLocation.sport.name
                    },
                    createdBy: user.id
                }
            );
            if (updated) {
                setLocations(locations.map(loc => 
                    loc.id === updated.id ? updated : loc
                ));
                setModalVisible(false);
                setNewLocation({ 
                    name: '', 
                    address: '', 
                    latitude: 0, 
                    longitude: 0, 
                    sport: { id: '', name: '' } 
                });
                setSelectedResult(null);
                setSearchResults([]);
                setEditingLocation(null);
                Alert.alert('Success', 'Location updated successfully');
            }
        } catch (error) {
            console.error('Error updating location:', error);
            Alert.alert('Error', 'Failed to update location');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAllLocations = async () => {
        Alert.alert(
            "Delete All Locations",
            "Are you sure you want to delete all locations? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const res = await Requests.delete('training-locations/all');
                            if (res?.status === 200) {
                                setLocations([]);
                                Alert.alert('Success', 'All locations have been deleted');
                            } else {
                                Alert.alert('Error', 'Failed to delete all locations');
                            }
                        } catch (error) {
                            console.error('Error deleting all locations:', error);
                            Alert.alert('Error', 'Failed to delete all locations');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <ImageBackground
            style={{ flex: 1 }}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView style={styles.container}>
                <Stack.Screen
                    options={{
                        headerShown: false
                    }}
                />
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Training Locations</Text>
                    {/* <TouchableOpacity 
                        onPress={handleDeleteAllLocations} 
                        style={styles.deleteAllButton}>
                        <Ionicons name="trash-outline" size={24} color="white" />
                    </TouchableOpacity> */}
                </View>
                
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#2757CB" />
                    </View>
                )}

                <ScrollView style={styles.content}>
                    {locations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No training locations added yet</Text>
                            <TouchableOpacity 
                                style={styles.addButton}
                                onPress={() => setModalVisible(true)}>
                                <Ionicons name="add-circle-outline" size={24} color="white" />
                                <Text style={styles.addButtonText}>Add Location</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.locationsList}>
                            {locations.map((location, index) => (
                                <View key={index} style={styles.locationItem}>
                                    <View style={styles.locationInfo}>
                                        <Text style={styles.locationName}>{location.name}</Text>
                                        <Text style={styles.locationAddress}>{location.address}</Text>
                                    </View>
                                    <View style={styles.locationActions}>
                                        <TouchableOpacity 
                                            style={styles.editButton}
                                            onPress={() => handleEditLocation(location)}>
                                            <Ionicons name="pencil" size={20} color="#2757CB" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteLocation(location.id)}>
                                            <Ionicons name="trash" size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {locations.length > 0 && (
                    <TouchableOpacity 
                        style={styles.floatingAddButton}
                        onPress={() => setModalVisible(true)}>
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                )}

                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={handleCloseModal}>
                    <TouchableOpacity 
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            Keyboard.dismiss();
                            handleCloseModal();
                        }}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingLocation ? 'Edit Location' : 'Add New Location'}
                                </Text>
                                <TouchableOpacity onPress={handleCloseModal}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Location Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter location name"
                                    value={newLocation.name}
                                    onChangeText={(text) => setNewLocation({...newLocation, name: text})}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Sport</Text>
                                <List.Section>
                                    <List.Accordion
                                        title={newLocation.sport.id ? newLocation.sport.name : "Select a sport"}
                                        expanded={expandedSport}
                                        onPress={() => setExpandedSport(!expandedSport)}
                                        style={[
                                            styles.accordion,
                                            newLocation.sport.id ? styles.accordionSelected : null
                                        ]}
                                        titleStyle={[
                                            styles.accordionTitle,
                                            newLocation.sport.id ? styles.accordionTitleSelected : null
                                        ]}>
                                        {userSports && userSports.map((sport: UserSportResponse) => {
                                            const isSelected = newLocation.sport.id === sport.sportId;
                                            console.log('Sport item:', {
                                                sportId: sport.sportId,
                                                sportName: sport.sportName,
                                                isSelected,
                                                currentSportId: newLocation.sport.id
                                            });
                                            return (
                                                <List.Item
                                                    key={sport.id}
                                                    title={sport.sportName}
                                                    onPress={() => {
                                                        console.log('Selected sport:', sport);
                                                        setNewLocation(prev => ({
                                                            ...prev,
                                                            sport: {
                                                                id: sport.sportId,
                                                                name: sport.sportName
                                                            }
                                                        }));
                                                        setExpandedSport(false);
                                                    }}
                                                    style={[
                                                        styles.sportItem,
                                                        isSelected && styles.selectedSport
                                                    ]}
                                                    titleStyle={[
                                                        styles.sportItemText,
                                                        isSelected && styles.selectedSportText
                                                    ]}
                                                />
                                            );
                                        })}
                                    </List.Accordion>
                                </List.Section>
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter address"
                                    value={newLocation.address}
                                    onChangeText={(text) => {
                                        setNewLocation({...newLocation, address: text});
                                        setSelectedResult(null);
                                        setSearchResults([]);
                                    }}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.modalAddButton, styles.searchButton, isVerifying && styles.disabledButton]}
                                onPress={handleSearchAddress}
                                disabled={isVerifying}
                            >
                                {isVerifying ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.modalAddButtonText}>Search</Text>
                                )}
                            </TouchableOpacity>
                            {searchResults.length > 0 && (
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item) => item.place_id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.resultItem, selectedResult?.place_id === item.place_id && styles.selectedResultItem]}
                                            onPress={() => handleSelectResult(item)}
                                        >
                                            <Text style={styles.resultText}>{item.formatted_address}</Text>
                                        </TouchableOpacity>
                                    )}
                                    style={styles.resultsList}
                                />
                            )}
                            <TouchableOpacity 
                                style={[styles.modalAddButton, (!selectedResult || !newLocation.sport.id || isVerifying) && styles.disabledButton]}
                                onPress={editingLocation ? handleSaveEdit : handleAddLocation}
                                disabled={!selectedResult || !newLocation.sport.id || isVerifying}
                            >
                                <Text style={styles.modalAddButtonText}>
                                    {editingLocation ? 'Save Changes' : 'Add Location'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(39, 87, 203, 0.9)',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
    },
    deleteAllButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2757CB',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    locationsList: {
        gap: 10,
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    locationActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: 8,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    floatingAddButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#2757CB',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
    },
    searchButton: {
        backgroundColor: '#888',
        marginBottom: 10,
    },
    resultsList: {
        maxHeight: 120,
        marginBottom: 10,
    },
    resultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#f9f9f9',
    },
    selectedResultItem: {
        backgroundColor: '#cce5ff',
    },
    resultText: {
        fontSize: 15,
        color: '#333',
    },
    modalAddButton: {
        backgroundColor: '#2757CB',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    modalAddButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.7,
    },
    accordion: {
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    accordionSelected: {
        backgroundColor: '#E8F0FE',
        borderColor: '#2757CB',
    },
    accordionTitle: {
        fontWeight: '500',
        color: '#666',
        fontSize: 16,
    },
    accordionTitleSelected: {
        color: '#2757CB',
        fontWeight: 'bold',
    },
    sportItem: {
        marginBottom: 12,
        paddingVertical: 8,
    },
    sportItemText: {
        fontSize: 16,
        color: '#333',
    },
    selectedSport: {
        backgroundColor: '#E8F0FE',
    },
    selectedSportText: {
        fontWeight: 'bold',
        color: '#2757CB',
    },
});

export default ManageTrainingLocations; 