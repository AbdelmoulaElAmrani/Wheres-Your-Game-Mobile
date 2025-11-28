import {InvitationRequest} from "@/models/requestObjects/InvitationRequest";
import Requests from "@/services/Requests";


export class InvitationService {
    static async sendInvitation(invitation: InvitationRequest): Promise<string | undefined> {
        try {
            const res = await Requests.post('invitations', invitation);
            if (res?.status === 200 && res?.data) {
                return res.data
            }
            return undefined;
        } catch (e: any) {
            console.error('=== INVITATION SERVICE ERROR ===');
            console.error('Error:', e);
            console.error('Error Response:', e?.response);
            console.error('Error Response Data:', e?.response?.data);
            console.error('Error Response Status:', e?.response?.status);
            console.error('Error Message:', e?.message);
            console.error('================================');
            return undefined;
        }
    }
}