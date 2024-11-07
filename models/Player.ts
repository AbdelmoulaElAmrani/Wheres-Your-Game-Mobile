import {UserResponse} from "@/models/responseObjects/UserResponse";

export interface Player extends UserResponse {
    position?: string
}