import { YouTubeVideoSnippet } from "./YouTubeVideoSnippet";

/**
 * Represents an information about a YouTube video.
 */
export interface YouTubeVideoInformation {
    readonly kind: string;
    readonly etag: string;

    /**
     * The ID of the video.
     */
    readonly id: string;

    /**
     * The snippet of the video.
     */
    readonly snippet: YouTubeVideoSnippet;
};