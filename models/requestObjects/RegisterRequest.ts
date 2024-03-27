import UserType from "../UserType";

interface RegisterRequest 
{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    zipCode: string;
    bio: string;
    createdAt: Date;
    verified: boolean;
    role: UserType;

}

