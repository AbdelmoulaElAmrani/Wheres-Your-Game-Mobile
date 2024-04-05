import SportLevel from "./SportLevel";

export interface UserInterestedSport {
    score?: number;
    createAt?: Date;
    sportLevel?: SportLevel;
    sportId?: string;
    sportName?: string;

}