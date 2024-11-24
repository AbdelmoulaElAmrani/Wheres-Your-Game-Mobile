import Requests from "./Requests";


export class FriendRequestService {
    static declineFriendRequest = async (requestId: string) => {
        const res = await Requests.post(`friendRequest/decline?requestId=${requestId}`, {});
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;

    }
    static acceptFriendRequest = async (requestId: string) => {
        const res = await Requests.post(`friendRequest/accept?requestId=${requestId}`, {});
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static sendFriendRequest = async (senderId: string, receiverId: string) => {
        const res = await Requests.post(`friendRequest/send?senderId=${senderId}&receiverId=${receiverId}`, {});
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

}