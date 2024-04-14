import SportLevel from "@/models/SportLevel";

export interface UserSportResponse {
    id: any;
    score: number;
    createAt: Date;
    sportLevel: SportLevel;
    sportId: string;
    sportName: string;
    iconUrl: string;
}