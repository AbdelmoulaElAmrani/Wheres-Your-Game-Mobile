import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput, Keyboard, FlatList} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import { TrainingLocationService } from '@/services/TrainingLocationService';
import { TrainingLocation } from '@/models/responseObjects/TrainingLocation';
import { useSelector } from 'react-redux';
import { GooglePlacesAutocomplete } from 'expo-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground } from 'expo-image';

const GOOGLE_PLACES_API_KEY = "AIzaSyDlFo6upaajnGewXn4DX4-naBhsWPcn8VE";

const ManageTrainingLocations = () => {
    const router = useRouter();
    const [locations, setLocations] = useState<TrainingLocation[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        address: '',
        latitude: 0,
        longitude: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedResult, setSelectedResult] = useState<any | null>(null);
    const user = useSelector((state: any) => state.user.userData);
    // console.log('Redux user object:', user);

    useEffect(() => {
        loadLocations();
    }, []);

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
        console.log('Add Location clicked', newLocation, selectedResult);
        if (!newLocation.name || !selectedResult) {
            Alert.alert('Error', 'Please fill in all fields and select an address');
            return;
        }
        try {
            setIsLoading(true);
            console.log('userId being sent:', user.id);
            const location = await TrainingLocationService.createTrainingLocation({
                ...newLocation,
                createdBy: user.id
            });
            console.log('API result:', location);
            if (location) {
                setLocations([...locations, location]);
                setModalVisible(false);
                setNewLocation({ name: '', address: '', latitude: 0, longitude: 0 });
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
                    <View style={styles.headerRight} />
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
                                            onPress={() => {
                                                // TODO: Implement edit location functionality
                                            }}>
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
                    onRequestClose={() => setModalVisible(false)}>
                    <TouchableOpacity 
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            Keyboard.dismiss();
                            setModalVisible(false);
                        }}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Location</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Location Name"
                                value={newLocation.name}
                                onChangeText={(text) => setNewLocation({...newLocation, name: text})}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Address"
                                value={newLocation.address}
                                onChangeText={(text) => {
                                    setNewLocation({...newLocation, address: text});
                                    setSelectedResult(null);
                                    setSearchResults([]);
                                }}
                            />
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
                                style={[styles.modalAddButton, (!selectedResult || isVerifying) && styles.disabledButton]}
                                onPress={handleAddLocation}
                                disabled={!selectedResult || isVerifying}
                            >
                                <Text style={styles.modalAddButtonText}>Add Location</Text>
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
    headerRight: {
        width: 24,
    },
    backButton: {
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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
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
});

export default ManageTrainingLocations; 