import Requests from "@/services/Requests";

export class StorageService {
    static async upload(id: string, formData: FormData, isUser: boolean = true): Promise<any> {
        try {
            const endpoint = `/storage/upload/${id}/${isUser}`;
            const response = await Requests.post(endpoint, formData);

            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`Failed to upload: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error during file upload:', error);
            throw error;
        }
    }


    static async downloadImageByName(imageName: string): Promise<any> {
        try {
            const response = await Requests.get(`/storage/download/${imageName}`);

            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error during image download:', error);
            throw error;
        }
    }
}