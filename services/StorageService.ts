import Requests from "@/services/Requests";

export class StorageService {
    static async upload(id: string, formData: FormData, isUser: boolean = true): Promise<any> {
        try {
            const response = await Requests.post(`/storage/upload/${id}/${isUser}`, formData);
            console.log(response?.data);
            if (response?.status === 200) {
                return response?.data;
            } else {
                throw new Error(`Failed to upload: ${response?.status} ${response?.statusText}`);
            }
        } catch (error) {
            console.error('Error during file upload:', error);
            throw error;
        }
    }


    static async downloadImageByName(imageName: string, isIcon: boolean = false): Promise<any> {
        try {
            const response = await Requests.get(`/storage/download/${imageName}/${isIcon}`);
            if (response?.status === 200) {
                return response.data;
            } else {
                throw new Error(`Failed to download image: ${response?.status} ${response?.statusText}`);
            }
        } catch (error) {
            console.error('Error during image download:', error);
            throw error;
        }
    }
}