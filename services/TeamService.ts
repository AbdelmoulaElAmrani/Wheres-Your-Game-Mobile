import Requests from "@/services/Requests";

export class TeamService {
    static getUserTeams = async (userId: string) => {
        const res = await Requests.get(`team/all/${userId}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static getTeamPlayers = async (teamId: string) => {
        const res = await Requests.get(`team/allPlayers/${teamId}`);
        if (res?.status !== 200)
            return undefined;
        return res?.data;
    }
    static createTeam = async (team: any) => {
        const res = await Requests.post(`team/addTeam`, team);
        if (res?.status !== 200)
            return undefined;
        return res?.data;
    }
}