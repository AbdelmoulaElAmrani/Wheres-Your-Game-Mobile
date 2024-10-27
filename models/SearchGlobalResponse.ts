import {Player} from "@/models/Player";
import {Team} from "@/models/Team";

export interface SearchGlobalResponse {
    players: Player [],
    teams: Team []
}