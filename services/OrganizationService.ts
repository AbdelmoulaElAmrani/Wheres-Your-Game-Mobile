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

    static async sendCoachInviteRequest(receiverId: string): Promise<{success: boolean, message?: string}> {
        try {
            console.log('OrganizationService.sendCoachInviteRequest: Sending invitation to coach:', receiverId);
            const res = await Requests.post(`organization/send/invitation?receiverId=${receiverId}`, {});
            console.log('OrganizationService.sendCoachInviteRequest: Response status:', res?.status);
            console.log('OrganizationService.sendCoachInviteRequest: Response data:', res?.data);
            
            if (res?.status === 200) {
                return { success: true };
            } else {
                const errorMessage = res?.data || 'Failed to send invitation';
                console.error('OrganizationService.sendCoachInviteRequest: Non-200 status:', res?.status, errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (error: any) {
            console.error('OrganizationService.sendCoachInviteRequest: Error sending invitation:', error);
            console.error('OrganizationService.sendCoachInviteRequest: Error details:', JSON.stringify(error));
            const errorMessage = error?.response?.data || error?.message || 'Failed to send invitation request';
            return { success: false, message: errorMessage };
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