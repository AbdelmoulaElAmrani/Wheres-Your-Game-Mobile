export interface SportEventRequest
{
    id?: string;
    name: string;
    description?: string;
    zipCode?: string;
    ownerId: string;
    eventDate: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    ageGroups?: string[];
    eventTypes?: string[];
    levelsOfPlay?: string[];
}

