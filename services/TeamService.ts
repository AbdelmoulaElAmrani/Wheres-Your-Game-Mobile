import Requests from "@/services/Requests";

export class TeamService {
    static getUserTeams = async (userId: string, sportId?:string, organizationId?:string) => {
        let url = `team/all/${userId}`;
        const params: string[] = [];

        if (sportId) {
            params.push(`sportId=${sportId}`);
        }

        if (organizationId) {
            params.push(`organizationId=${organizationId}`);
        }

        if (params.length > 0) {
            url += `?${params.join("&")}`;
        }

        const res = await Requests.get(url);
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

    static globalSearchTeamPlayers = async (name: string) => {
        const res = await Requests.get(`team/search/${name}`);
        if (res?.status !== 200)
            return undefined;
        return res?.data;
    }

    static async getTeamById(teamId: string) {
        const res = await Requests.get(`team/${teamId}`);
        if (res?.status !== 200)
            return undefined;
        return res?.data;
    }
}