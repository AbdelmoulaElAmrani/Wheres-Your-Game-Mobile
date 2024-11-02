import { PostResponse } from './../models/responseObjects/PostResponse';

import { PostRequest } from "@/models/requestObjects/PostRequest";
import Requests from "./Requests";
import { Page } from '@/models/generic/Page';

export class PostService {
    static async createPost(postRequest: PostRequest) {
        const res = await Requests.post('posts', postRequest);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static async getUserPosts(accountId: string) {
        const res = await Requests.get(`posts/accounts/${accountId}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static async deletePost(postId: string) {
        const res = await Requests.delete(`posts/${postId}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }

    static async getFilteredPosts(filter: string, page: number, size: number): Promise<Page<PostResponse> | undefined> 
    {
        const res = await Requests.get(`posts?filter=${filter}&page=${page}&size=${size}`);
        if (res?.status !== 200) {
            return undefined;
        }
        return res?.data;
    }
}