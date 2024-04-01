import SportLevel from "./SportLevel";

export interface UserInteresstedSport {
    score?: number;
    createAt?: Date;
    sportLevel?: SportLevel;
    sportId?: string;
    sportName?: string;

}