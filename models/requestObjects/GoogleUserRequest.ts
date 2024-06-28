import {User} from "@react-native-google-signin/google-signin";
import {RegisterRequest} from "@/models/requestObjects/RegisterRequest";

export interface GoogleUserRequest {
    userData: RegisterRequest | undefined,
    googleUser: User,
}