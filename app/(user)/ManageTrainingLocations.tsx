import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput, Keyboard, FlatList, KeyboardAvoidingView, Platform} from 'react-native';
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
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

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
    const [showStyledAlert, setShowStyledAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        onCancel: () => {}
    });
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
                
                // If there's only one result, automatically select it
                if (data.results.length === 1) {
                    handleSelectResult(data.results[0]);
                }
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
            if (Platform.OS === 'android') {
                setAlertConfig({
                    title: 'Error',
                    message: 'Please fill in all fields and select an address and sport',
                    onConfirm: () => setShowStyledAlert(false),
                    onCancel: () => setShowStyledAlert(false)
                });
                setShowStyledAlert(true);
            } else {
                Alert.alert('Error', 'Please fill in all fields and select an address and sport');
            }
            return;
        }

        // Check for duplicate location (same address and sport)
        const isDuplicate = locations.some(loc => 
            loc.address === newLocation.address && 
            loc.sport.id === newLocation.sport.id
        );

        if (isDuplicate) {
            if (Platform.OS === 'android') {
                setAlertConfig({
                    title: 'Cannot Add Location',
                    message: 'A location with this address and sport already exists.',
                    onConfirm: () => setShowStyledAlert(false),
                    onCancel: () => setShowStyledAlert(false)
                });
                setShowStyledAlert(true);
            } else {
                Alert.alert(
                    'Cannot Add Location',
                    'A location with this address and sport already exists.'
                );
            }
            return;
        }
        
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
                if (Platform.OS === 'android') {
                    setAlertConfig({
                        title: 'Success',
                        message: 'Location added successfully',
                        onConfirm: () => setShowStyledAlert(false),
                        onCancel: () => setShowStyledAlert(false)
                    });
                    setShowStyledAlert(true);
                } else {
                    Alert.alert('Success', 'Location added successfully');
                }
            } else {
                if (Platform.OS === 'android') {
                    setAlertConfig({
                        title: 'Error',
                        message: 'No location returned from API',
                        onConfirm: () => setShowStyledAlert(false),
                        onCancel: () => setShowStyledAlert(false)
                    });
                    setShowStyledAlert(true);
                } else {
                    Alert.alert('Error', 'No location returned from API');
                }
            }
        } catch (error) {
            console.error('Error adding location:', error);
            if (Platform.OS === 'android') {
                setAlertConfig({
                    title: 'Error',
                    message: 'Failed to add location',
                    onConfirm: () => setShowStyledAlert(false),
                    onCancel: () => setShowStyledAlert(false)
                });
                setShowStyledAlert(true);
            } else {
                Alert.alert('Error', 'Failed to add location');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (Platform.OS === 'android') {
            // Custom styled alert for Android
            setAlertConfig({
                title: 'Delete Location',
                message: 'Are you sure you want to delete this location?',
                onConfirm: async () => {
                    try {
                        setIsLoading(true);
                        const success = await TrainingLocationService.deleteTrainingLocation(id);
                        if (success) {
                            setLocations(locations.filter(loc => loc.id !== id));
                            setShowStyledAlert(false);
                            // Show success alert
                            setAlertConfig({
                                title: 'Success',
                                message: 'Location deleted successfully',
                                onConfirm: () => setShowStyledAlert(false),
                                onCancel: () => setShowStyledAlert(false)
                            });
                            setShowStyledAlert(true);
                        }
                    } catch (error) {
                        console.error('Error deleting location:', error);
                        setShowStyledAlert(false);
                        // Show error alert
                        setAlertConfig({
                            title: 'Error',
                            message: 'Failed to delete location',
                            onConfirm: () => setShowStyledAlert(false),
                            onCancel: () => setShowStyledAlert(false)
                        });
                        setShowStyledAlert(true);
                    } finally {
                        setIsLoading(false);
                    }
                },
                onCancel: () => setShowStyledAlert(false)
            });
            setShowStyledAlert(true);
        } else {
            // Native Alert for iOS
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
        }
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
            if (Platform.OS === 'android') {
                setAlertConfig({
                    title: 'Error',
                    message: 'Please select a valid address and sport',
                    onConfirm: () => setShowStyledAlert(false),
                    onCancel: () => setShowStyledAlert(false)
                });
                setShowStyledAlert(true);
            } else {
                Alert.alert('Error', 'Please select a valid address and sport');
            }
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
                if (Platform.OS === 'android') {
                    setAlertConfig({
                        title: 'Success',
                        message: 'Location updated successfully',
                        onConfirm: () => setShowStyledAlert(false),
                        onCancel: () => setShowStyledAlert(false)
                    });
                    setShowStyledAlert(true);
                } else {
                    Alert.alert('Success', 'Location updated successfully');
                }
            }
        } catch (error) {
            console.error('Error updating location:', error);
            if (Platform.OS === 'android') {
                setAlertConfig({
                    title: 'Error',
                    message: 'Failed to update location',
                    onConfirm: () => setShowStyledAlert(false),
                    onCancel: () => setShowStyledAlert(false)
                });
                setShowStyledAlert(true);
            } else {
                Alert.alert('Error', 'Failed to update location');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAllLocations = async () => {
        if (Platform.OS === 'android') {
            setAlertConfig({
                title: 'Delete All Locations',
                message: 'Are you sure you want to delete all locations? This action cannot be undone.',
                onConfirm: async () => {
                    try {
                        setIsLoading(true);
                        const res = await Requests.delete('training-locations/all');
                        if (res?.status === 200) {
                            setLocations([]);
                            setShowStyledAlert(false);
                            setAlertConfig({
                                title: 'Success',
                                message: 'All locations have been deleted',
                                onConfirm: () => setShowStyledAlert(false),
                                onCancel: () => setShowStyledAlert(false)
                            });
                            setShowStyledAlert(true);
                        } else {
                            setShowStyledAlert(false);
                            setAlertConfig({
                                title: 'Error',
                                message: 'Failed to delete all locations',
                                onConfirm: () => setShowStyledAlert(false),
                                onCancel: () => setShowStyledAlert(false)
                            });
                            setShowStyledAlert(true);
                        }
                    } catch (error) {
                        console.error('Error deleting all locations:', error);
                        setShowStyledAlert(false);
                        setAlertConfig({
                            title: 'Error',
                            message: 'Failed to delete all locations',
                            onConfirm: () => setShowStyledAlert(false),
                            onCancel: () => setShowStyledAlert(false)
                        });
                        setShowStyledAlert(true);
                    } finally {
                        setIsLoading(false);
                    }
                },
                onCancel: () => setShowStyledAlert(false)
            });
            setShowStyledAlert(true);
        } else {
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
        }
    };

    const handleDuplicateLocation = (location: TrainingLocation) => {
        setEditingLocation(null);
        setNewLocation({
            name: `${location.name} (Copy)`,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            sport: { id: '', name: '' } // Reset sport to force selection
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
                                        <Text style={styles.locationSport}>{location.sport.name}</Text>
                                        <Text style={styles.locationAddress}>{location.address}</Text>
                                    </View>
                                    <View style={styles.locationActions}>
                                        <TouchableOpacity 
                                            style={styles.duplicateButton}
                                            onPress={() => handleDuplicateLocation(location)}>
                                            <Ionicons name="copy-outline" size={20} color="#2757CB" />
                                        </TouchableOpacity>
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
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={{flex: 1}}
                            activeOpacity={1}
                            onPress={() => {
                                Keyboard.dismiss();
                                handleCloseModal();
                            }}
                        />
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={styles.modalContent}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingLocation ? 'Edit Location' : 'Add New Location'}
                                </Text>
                                <TouchableOpacity onPress={handleCloseModal}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView 
                                style={styles.modalScrollView}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.modalScrollContent}
                            >
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
                                {!selectedResult && (
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
                                        <Text style={styles.selectedAddressLabel}>Selected Address:</Text>
                                        <Text style={styles.selectedAddressText}>{selectedResult.formatted_address}</Text>
                                        <TouchableOpacity
                                            style={styles.changeAddressButton}
                                            onPress={() => {
                                                setSelectedResult(null);
                                                setSearchResults([]);
                                            }}
                                        >
                                            <Text style={styles.changeAddressButtonText}>Change Address</Text>
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
                                {searchResults.length > 0 && selectedResult && (
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
                                )}
                            </ScrollView>
                            <TouchableOpacity 
                                style={[styles.modalAddButton, (!selectedResult || !newLocation.sport.id || isVerifying) && styles.disabledButton]}
                                onPress={editingLocation ? handleSaveEdit : handleAddLocation}
                                disabled={!selectedResult || !newLocation.sport.id || isVerifying}
                            >
                                <Text style={styles.modalAddButtonText}>
                                    {editingLocation ? 'Save Changes' : 'Add Location'}
                                </Text>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
            </SafeAreaView>
            
            {/* Custom Styled Alert for Android */}
            <StyledAlert
                visible={showStyledAlert}
                config={alertConfig}
                onClose={() => setShowStyledAlert(false)}
            />
        </ImageBackground>
    );
};

// Custom Styled Alert Component for Android
const StyledAlert = ({ visible, config, onClose }: {
    visible: boolean;
    config: {
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel: () => void;
    };
    onClose: () => void;
}) => {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.alertOverlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>{config.title}</Text>
                        <Text style={styles.alertMessage}>{config.message}</Text>
                        
                        <View style={[
                            styles.alertButtonContainer,
                            config.title !== 'Delete Location' && styles.alertSingleButtonContainer
                        ]}>
                            {config.title === 'Delete Location' && (
                                <TouchableOpacity
                                    style={[styles.alertButton, styles.alertCancelButton]}
                                    onPress={config.onCancel}
                                >
                                    <Text style={styles.alertCancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                style={[
                                    styles.alertButton, 
                                    styles.alertConfirmButton,
                                    config.title !== 'Delete Location' && styles.alertSingleButton
                                ]}
                                onPress={config.onConfirm}
                            >
                                <Text style={styles.alertConfirmButtonText}>
                                    {config.title === 'Delete Location' ? 'Delete' : 'OK'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
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
        paddingVertical: 15,
        backgroundColor: 'rgba(39, 87, 203, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: -1,
    },
    backButton: {
        padding: 8,
        zIndex: 1,
    },
    deleteAllButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        padding: 15,
        marginBottom: hp(8),
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
        gap: 12,
        paddingBottom: 100,
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#2757CB',
    },
    locationInfo: {
        flex: 1,
        marginRight: 10,
    },
    locationName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    locationSport: {
        fontSize: 15,
        color: '#2757CB',
        fontWeight: '500',
        marginBottom: 4,
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    locationActions: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 4,
        borderRadius: 8,
        gap: 4,
    },
    duplicateButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#E8F0FE',
    },
    editButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#E8F0FE',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#FFE5E5',
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: Platform.OS === 'ios' ? 'flex-end' : 'center',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 80 : 0,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '92%',
        maxWidth: 400,
        maxHeight: Platform.OS === 'ios' ? '85%' : '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
        color: '#333',
    },
    searchButton: {
        backgroundColor: '#2757CB',
        marginBottom: 16,
        borderRadius: 12,
        padding: 14,
    },
    resultsList: {
        maxHeight: 150,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    resultItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    selectedResultItem: {
        backgroundColor: '#E8F0FE',
        borderLeftWidth: 3,
        borderLeftColor: '#2757CB',
    },
    resultText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 20,
    },
    modalAddButton: {
        backgroundColor: '#2757CB',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
        shadowColor: '#2757CB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    modalAddButtonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
        backgroundColor: '#999',
    },
    accordion: {
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    accordionSelected: {
        backgroundColor: '#E8F0FE',
        borderColor: '#2757CB',
    },
    accordionTitle: {
        fontWeight: '500',
        color: '#666',
        fontSize: 16,
        paddingVertical: 4,
    },
    accordionTitleSelected: {
        color: '#2757CB',
        fontWeight: '600',
    },
    sportItem: {
        marginBottom: 8,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 8,
    },
    sportItemText: {
        fontSize: 16,
        color: '#333',
        paddingLeft: 8,
    },
    selectedSport: {
        backgroundColor: '#E8F0FE',
    },
    selectedSportText: {
        fontWeight: '600',
        color: '#2757CB',
    },
    selectedAddressContainer: {
        backgroundColor: '#E8F0FE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2757CB',
    },
    selectedAddressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2757CB',
        marginBottom: 4,
    },
    selectedAddressText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        lineHeight: 18,
    },
    changeAddressButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#2757CB',
    },
    changeAddressButtonText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
    },
    multipleResultsContainer: {
        marginBottom: 16,
    },
    multipleResultsLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    modalScrollView: {
        maxHeight: 400,
    },
    modalScrollContent: {
        paddingBottom: 20,
    },
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    alertContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    alertContent: {
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 28,
        textAlign: 'center',
        lineHeight: 22,
    },
    alertButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 12,
    },
    alertButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    alertCancelButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    alertCancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6c757d',
    },
    alertConfirmButton: {
        backgroundColor: '#2757CB',
    },
    alertConfirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    alertSingleButton: {
        backgroundColor: '#2757CB',
        maxWidth: 200,
        alignSelf: 'center',
    },
    alertSingleButtonContainer: {
        justifyContent: 'center',
    },
});

export default ManageTrainingLocations; 