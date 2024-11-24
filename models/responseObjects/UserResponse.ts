import Gender from "../Gender";
import SportLevel from "../SportLevel";
import {SocialMediaLinksResponse} from "./SocialMediaLinksResponse";

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
    socialMediaLinks?: SocialMediaLinksResponse;
    followers?: string [];
    preferenceSport?: string;
    visible: boolean;
    blockedByPrincipal: boolean;
    blockedByTheUser: boolean;
    children?: ChildResponse [];
}

export interface ChildResponse {
    fullName: string;
    id: string;
}