import {String} from './../node_modules/lightningcss/node/ast.d';
import Requests from "./Requests";


export class ChildrenService {
    static async getMyChildren() {

    }

    static async sendParentRequest(childId: string) {
        try {
            const res = await Requests.post(`parent-child/send-request?childId=${childId}`, {});
            if (res?.status !== 200) {
                return false;
            }
            return true;
        } catch (e: any) {
            return false;
        }

    }

    static async acceptParentRequest(requestId: String) {
        try {
            console.log('in service' + requestId);
            const res = await Requests.post(`parent-child/respond-request?requestId=${requestId}&accept=${true}`, {});
            if (res?.status !== 200) {
                return false;
            }
            return true;
        } catch (e: any) {
            console.error(e);
            return false;
        }

    }

    static async rejectParentRequest(requestId: String) {
        try {
            const res = await Requests.post(`parent-child/respond-request?requestId=${requestId}&accept=false`, {});
            if (res?.status !== 200) {
                return false;
            }
            return true;
        } catch (e: any) {
            return false;
        }
    }
}
