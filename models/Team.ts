export interface Team {
    id: string;
    name: string;
    imageUrl: string;
    imgUrl?: string;
    active: boolean;
    score: number | 0;
}