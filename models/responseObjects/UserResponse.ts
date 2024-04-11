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
    phoneCountryCode: string;
    gender: Gender;


}