import Gender from "../Gender";

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
}