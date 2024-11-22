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
        } catch (e) {
            return undefined;
        }
    }
}