export interface SportEvent {
    id: number;
    name: string;
    description: string;
    zipCode: string;
    eventDate: Date;
    address?: string;
    latitude?: number;
    longitude?: number;
    owner: string;
    sportId: string;
    imageUri: string;
}

