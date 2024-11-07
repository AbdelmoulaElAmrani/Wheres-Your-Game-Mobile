import {Player} from "@/models/Player";

export interface Team {
    id: string;
    name: string;
    imgUrl?: string;
    active: boolean;
    score: number | 0;
    founded?: Date;
    members: Player [],
    league?: string,
    coach?: string,
    address: string,
    country: string,
}