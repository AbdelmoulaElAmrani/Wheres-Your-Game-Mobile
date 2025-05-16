import Requests from "./Requests";
import { TrainingLocation } from '../models/TrainingLocation';

export class TrainingLocationService {
    static async getTrainingLocations(): Promise<TrainingLocation[] | undefined> {
        try {
            console.log('Fetching training locations...');
            const res = await Requests.get('api/training-locations/user');
            console.log('API Response:', res);
            console.log('Response status:', res?.status);
            console.log('Response data:', res?.data);
            
            if (res?.status !== 200) {
                console.error('Error status received:', res?.status);
                return undefined;
            }
            return res.data;
        } catch (error) {
            console.error('Error in getTrainingLocations:', error);
            throw error;
        }
    }

    static async createTrainingLocation(location: Partial<TrainingLocation>): Promise<TrainingLocation | undefined> {
        try {
            const { name, address, latitude, longitude, createdBy } = location;
            console.log('Payload being sent to backend:', { name, address, latitude, longitude, createdBy });
            const res = await Requests.post('api/training-locations', { name, address, latitude, longitude, createdBy });
            console.log('Backend response:', res);
            
            if (!res) {
                console.error('No response from server');
                return undefined;
            }
            
            if (res.status !== 200 && res.status !== 201) {
                console.error('Server returned error status:', res.status);
                return undefined;
            }
            
            const savedLocation = res.data;
            console.log('Saved location:', savedLocation);
            return savedLocation;
        } catch (error) {
            console.error('Error in createTrainingLocation:', error);
            throw error;
        }
    }

    static async updateTrainingLocation(id: string, location: Partial<TrainingLocation>): Promise<TrainingLocation | undefined> {
        try {
            console.log('Updating location:', { id, location });
            const res = await Requests.put(`api/training-locations/${id}`, location);
            console.log('Update response:', res);
            if (res?.status !== 200) {
                console.error('Update failed with status:', res?.status);
                return undefined;
            }
            return res.data;
        } catch (error) {
            console.error('Error in updateTrainingLocation:', error);
            throw error;
        }
    }

    static async deleteTrainingLocation(id: string): Promise<boolean> {
        try {
            console.log('Deleting location:', id);
            const res = await Requests.delete(`api/training-locations/${id}`);
            console.log('Delete response:', res);
            return res?.status === 200;
        } catch (error) {
            console.error('Error in deleteTrainingLocation:', error);
            throw error;
        }
    }
}
