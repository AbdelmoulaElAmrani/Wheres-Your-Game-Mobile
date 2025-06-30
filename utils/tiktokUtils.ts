export interface TikTokVideoInfo {
    isValid: boolean;
    platform: 'tiktok' | null;
    videoId: string | null;
    url: string;
}

export const detectTikTokVideo = (url: string): TikTokVideoInfo => {
    // TikTok URL patterns
    const tiktokPatterns = [
        // Standard TikTok video URLs
        /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
        // TikTok short URLs
        /https?:\/\/(?:www\.)?tiktok\.com\/t\/([a-zA-Z0-9]+)/,
        // TikTok vm.tiktok.com URLs
        /https?:\/\/vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
        // TikTok vt.tiktok.com URLs
        /https?:\/\/vt\.tiktok\.com\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of tiktokPatterns) {
        const match = url.match(pattern);
        if (match) {
            return {
                isValid: true,
                platform: 'tiktok',
                videoId: match[1],
                url: url,
            };
        }
    }

    return {
        isValid: false,
        platform: null,
        videoId: null,
        url: url,
    };
};

export const extractTikTokVideoId = (url: string): string | null => {
    const videoInfo = detectTikTokVideo(url);
    return videoInfo.videoId;
};

export const isTikTokUrl = (url: string): boolean => {
    return detectTikTokVideo(url).isValid;
}; 