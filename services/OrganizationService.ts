import {UserResponse} from "@/models/responseObjects/UserResponse";
import Requests from "@/services/Requests";

export class OrganizationService {

    static async declineOrganizationRequest(requestId: string): Promise<boolean> {
        try {
            const res = await Requests.post(`organization/decline/invitation?requestId=${requestId}`, {});
            return res?.status === 200;
        } catch (error) {
            console.error('Error declining invitation:', error);
            return false;
        }
    }

    static async acceptOrganizationRequest(requestId: string): Promise<boolean> {
        try {
            const res = await Requests.post(`organization/accept/invitation?requestId=${requestId}`, {});
            return res?.status === 200;
        } catch (error) {
            console.error('Error accepting invitation:', error);
            return false;
        }
    }

    static async sendCoachInviteRequest(receiverId: string): Promise<any> {
        try {
            const res = await Requests.post(`organization/send/invitation?receiverId=${receiverId}`, {});
            return res?.status === 200;
        } catch (error) {
            console.error('Error sending invitation:', error);
            return false;
        }
    }

    static async getAllCoachesOfThisSport(organizationId: string, sportId: string): Promise<UserResponse[]> {
        try {
            const res = await Requests.get(`organization/${organizationId}/coaches-by-sport/${sportId}`);
            return res?.status === 200 ? res.data : [];
        } catch (error) {
            console.error('Error fetching coaches by sport:', error);
            return [];
        }
    }

    static async getOrganizationsByCoachId(coachId: string): Promise<UserResponse[]> {
        try {
            const res = await Requests.get(`organization/coach/${coachId}`);
            return res?.status === 200 ? res.data : [];
        } catch (error) {
            console.error('Error fetching organizations for coach:', error);
            return [];
        }
    }

    static async getCoachesByOrganization(organizationId: string): Promise<UserResponse[] | undefined> {
        try {
            const res = await Requests.get(`organization/${organizationId}/coaches`);
            return res?.status === 200 ? res.data : undefined;
        } catch (error) {
            console.error('Error fetching coaches:', error);
            return undefined;
        }
    }

    
    static async getAllInvitations(receiverId: string): Promise<any[] | undefined> {
        try {
            const res = await Requests.get(`organization/all/invitation/${receiverId}`);
            return res?.status === 200 ? res.data : undefined;
        } catch (error) {
            console.error('Error fetching invitations:', error);
            return undefined;
        }
    }
}