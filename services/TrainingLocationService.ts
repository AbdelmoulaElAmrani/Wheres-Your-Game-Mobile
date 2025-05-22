import Requests from "./Requests";
import { TrainingLocation } from '../models/TrainingLocation';
import { API_URI } from '@/appConfig';
import { AxiosError } from 'axios';
import { SportService } from './SportService';
import Sport from '@/models/Sport';
import { AuthService } from './AuthService';
import { store } from '@/redux/ReduxConfig';

export class TrainingLocationService {
    static async getTrainingLocations(): Promise<TrainingLocation[] | undefined> {
        try {
            const res = await Requests.get('training-locations/user');
            
            if (!res || res.status !== 200 || !res.data) {
                return [];
            }

            // Ensure we have an array of locations
            const locationsData = Array.isArray(res.data) ? res.data : [res.data];

            // Get user's sports for name lookup
            let sportsMap = new Map<string, string>();
            try {
                const currentUser = store.getState().user.userData;
                if (currentUser?.id) {
                    const userSports = await SportService.getUserSport(currentUser.id);
                    if (userSports && userSports.length > 0) {
                        sportsMap = new Map(
                            userSports
                                .filter((sport: any) => sport.sportId && sport.sportName)
                                .map((sport: any) => [sport.sportId, sport.sportName])
                        );
                    }
                }
            } catch (sportError) {
                // Silently handle error
            }

            // Transform the response to match our TrainingLocation interface
            const locations: TrainingLocation[] = locationsData.map((loc: any) => {
                const sportId = loc.sport?.id || loc.sportId;
                let sportName = 'Unknown Sport';
                
                if (loc.sport?.name) {
                    sportName = loc.sport.name;
                } else if (sportId && sportsMap.has(sportId)) {
                    sportName = sportsMap.get(sportId) || 'Unknown Sport';
                }
                
                return {
                    id: loc.id || '',
                    name: loc.name || '',
                    address: loc.address || '',
                    latitude: typeof loc.latitude === 'number' ? loc.latitude : parseFloat(loc.latitude) || 0,
                    longitude: typeof loc.longitude === 'number' ? loc.longitude : parseFloat(loc.longitude) || 0,
                    sport: {
                        id: sportId || '',
                        name: sportName
                    },
                    active: loc.isActive === true || loc.active === true,
                    deleted: loc.deleted === true,
                    createdAt: loc.createdAt || '',
                    updatedAt: loc.updatedAt || '',
                    createdBy: loc.createdBy || ''
                };
            });

            return locations;
        } catch (error) {
            if (error instanceof AxiosError) {
                // Silently handle error
            }
            return [];
        }
    }

    static async createTrainingLocation(location: Partial<TrainingLocation>): Promise<TrainingLocation | undefined> {
        try {
            if (!location.sport?.id) {
                throw new Error('Sport ID is required');
            }

            // Structure the payload for the backend
            const payload = {
                name: location.name,
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
                createdBy: location.createdBy,
                sport: {
                    id: location.sport.id
                }
            };

            console.log('Payload being sent to backend:', JSON.stringify(payload, null, 2));
            console.log('Full URL:', `${API_URI}training-locations`);
            const res = await Requests.post('training-locations', payload);
            console.log('Backend response:', res);
            console.log('Response status:', res?.status);
            console.log('Response data:', res?.data);
            console.log('Response headers:', res?.headers);
            
            if (!res) {
                console.error('No response from server');
                return undefined;
            }
            
            if (res.status !== 200 && res.status !== 201) {
                console.error('Server returned error status:', res.status);
                console.error('Error details:', res.data);
                return undefined;
            }
            
            // Transform the response to match our TrainingLocation interface
            const savedLocation: TrainingLocation = {
                id: res.data.id,
                name: res.data.name,
                address: res.data.address,
                latitude: res.data.latitude,
                longitude: res.data.longitude,
                sport: {
                    id: res.data.sport.id,
                    name: res.data.sport.name
                },
                active: res.data.active,
                deleted: res.data.deleted,
                createdAt: res.data.createdAt,
                updatedAt: res.data.updatedAt,
                createdBy: res.data.createdBy
            };
            
            console.log('Transformed saved location:', JSON.stringify(savedLocation, null, 2));
            return savedLocation;
        } catch (error) {
            console.error('Error in createTrainingLocation:', error);
            if (error instanceof AxiosError) {
                if (error.response) {
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                    console.error('Error response headers:', error.response.headers);
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
            }
            throw error;
        }
    }

    static async updateTrainingLocation(id: string, location: Partial<TrainingLocation>): Promise<TrainingLocation | undefined> {
        try {
            if (!location.sport?.id) {
                throw new Error('Sport ID is required');
            }

            // Structure the payload for the backend
            const payload = {
                name: location.name,
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
                createdBy: location.createdBy,
                sport: {
                    id: location.sport.id
                }
            };

            console.log('Updating location:', { id, payload: JSON.stringify(payload, null, 2) });
            const res = await Requests.put(`training-locations/${id}`, payload);
            console.log('Update response:', res);
            if (res?.status !== 200) {
                console.error('Update failed with status:', res?.status);
                return undefined;
            }

            // Transform the response to match our TrainingLocation interface
            const updatedLocation: TrainingLocation = {
                id: res.data.id,
                name: res.data.name,
                address: res.data.address,
                latitude: res.data.latitude,
                longitude: res.data.longitude,
                sport: {
                    id: res.data.sport.id,
                    name: res.data.sport.name
                },
                active: res.data.active,
                deleted: res.data.deleted,
                createdAt: res.data.createdAt,
                updatedAt: res.data.updatedAt,
                createdBy: res.data.createdBy
            };

            return updatedLocation;
        } catch (error) {
            console.error('Error in updateTrainingLocation:', error);
            throw error;
        }
    }

    static async deleteTrainingLocation(id: string): Promise<boolean> {
        try {
            console.log('Deleting location:', id);
            const res = await Requests.delete(`training-locations/${id}`);
            console.log('Delete response:', res);
            return res?.status === 200;
        } catch (error) {
            console.error('Error in deleteTrainingLocation:', error);
            throw error;
        }
    }

    static async getTrainingLocationsMap(): Promise<TrainingLocation[] | undefined> {
        try {
            const res = await Requests.get('training-locations');
            
            if (!res || res.status !== 200 || !res.data) {
                return [];
            }

            // Ensure we have an array of locations
            const locationsData = Array.isArray(res.data) ? res.data : [res.data];

            // Get user's sports for name lookup
            let sportsMap = new Map<string, string>();
            try {
                const currentUser = store.getState().user.userData;
                if (currentUser?.id) {
                    const userSports = await SportService.getUserSport(currentUser.id);
                    if (userSports && userSports.length > 0) {
                        sportsMap = new Map(
                            userSports
                                .filter((sport: any) => sport.sportId && sport.sportName)
                                .map((sport: any) => [sport.sportId, sport.sportName])
                        );
                    }
                }
            } catch (sportError) {
                // Silently handle error
            }

            // Transform the response to match our TrainingLocation interface
            const locations: TrainingLocation[] = locationsData.map((loc: any) => {
                const sportId = loc.sport?.id || loc.sportId;
                let sportName = 'Unknown Sport';
                
                if (loc.sport?.name) {
                    sportName = loc.sport.name;
                } else if (sportId && sportsMap.has(sportId)) {
                    sportName = sportsMap.get(sportId) || 'Unknown Sport';
                }
                
                return {
                    id: loc.id || '',
                    name: loc.name || '',
                    address: loc.address || '',
                    latitude: typeof loc.latitude === 'number' ? loc.latitude : parseFloat(loc.latitude) || 0,
                    longitude: typeof loc.longitude === 'number' ? loc.longitude : parseFloat(loc.longitude) || 0,
                    sport: {
                        id: sportId || '',
                        name: sportName
                    },
                    active: loc.isActive === true || loc.active === true,
                    deleted: loc.deleted === true,
                    createdAt: loc.createdAt || '',
                    updatedAt: loc.updatedAt || '',
                    createdBy: loc.createdBy || ''
                };
            });

            return locations;
        } catch (error) {
            if (error instanceof AxiosError) {
                // Silently handle error
            }
            return [];
        }
    }
}
