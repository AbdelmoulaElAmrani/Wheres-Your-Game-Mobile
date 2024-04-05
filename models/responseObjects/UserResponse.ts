import Gender from "../Gender";

export interface UserResponse {
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
    phoneContryCode: string;
    gender: Gender;

}