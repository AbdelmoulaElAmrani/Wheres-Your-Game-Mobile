import Gender from "../Gender";
import SportLevel from "../SportLevel";

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string;
    imageUrl: string;
    zipCode: string;
    address: string;
    phoneNumber: string;
    role: string;
    age: number;
    countryCode: string;
    gender: Gender;
    dateOfBirth: Date;
    yearsOfExperience: number;
    isCertified: boolean;
    positionCoached: string;
    organizationName?: string;
    ageGroup?: string[];
    skillLevel?: SportLevel[];
    country?: string;
    stateRegion?: string;
    city?: string;
    followers?: [];
    facebookAccount?: string;
    tiktokAccount?: string;
    instagramAccount?: string;
    youtubeAccount?: string;
}