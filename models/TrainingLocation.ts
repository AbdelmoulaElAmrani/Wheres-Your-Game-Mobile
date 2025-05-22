export interface TrainingLocation {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    sport: {
        id: string;
        name: string;
    };
    active: boolean;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}