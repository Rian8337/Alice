import { YouTubeVideoThumbnail } from "./YouTubeVideoThumbnail";

/**
 * Represents a YouTube video's snippet, returned from an API response.
 */
export interface YouTubeVideoSnippet {
    /**
     * The ID of the channel containing this video.
     */
    readonly channelId: string;

    /**
     * The title of the video.
     */
    title: string;

    /**
     * The description of the video.
     */
    readonly description: string;

    /**
     * The thumbnails of this video.
     */
    readonly thumbnails: {
        readonly default: YouTubeVideoThumbnail;
        readonly medium: YouTubeVideoThumbnail;
        readonly high: YouTubeVideoThumbnail;
        readonly standard: YouTubeVideoThumbnail;
        readonly maxres?: YouTubeVideoThumbnail;
    };

    /**
     * The name of the channel containing this video.
     */
    readonly channelTitle: string;
}
