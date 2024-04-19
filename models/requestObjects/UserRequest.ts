import Gender from "../Gender";

export interface UserRequest {
    firstName: string;
    lastName: string;
    bio: string;
    zipCode: string;
    address: string;
    gender: Gender;
}
