import Requests from "./Requests";

export class BlockService {

    static async blockUser(id: string, childId: string | undefined = undefined): Promise<boolean> {
        try {
            const res = await Requests.post(`block/block-user?blockedId=${id}&childId=${childId ? childId : ""}`, {});
            return res?.status === 200;
        } catch (e: any) {
            return false;
        }
    }

    static async unBlockUser(id: string, childId: string | undefined = undefined): Promise<boolean> {
        try {
            const res = await Requests.delete(`block/unblock-user?blockedId=${id}&childId=${childId ? childId : ""}`);
            return res?.status === 200;
        } catch (e: any) {
            return false;
        }

    }
}
