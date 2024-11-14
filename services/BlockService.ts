import Requests from "./Requests";

export class BlockService {

    static async blockUser(id: string): Promise<boolean> {
       try {
            const res = await Requests.post(`block/block-user?blockedId=${id}`, {});
            if (res?.status !== 200) {
                return false;
            }
            return true;
           
       }
         catch (e : any) {
            return false;
         }
    }

    static async unBlockUser(id: string): Promise<boolean> {
        try {
            const res = await Requests.delete(`block/unblock-user?blockedId=${id}`);
            if (res?.status !== 200) {
                return false;
            }
            return true;
        } catch (e : any) {
            return false;
    }

    }
}
