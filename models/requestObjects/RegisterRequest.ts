import UserType from "../UserType";

export interface RegisterRequest 
{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    countryCode: string;
    address: string;
    zipCode: string;
    bio: string;
    verified: boolean;
    role: UserType;

}

