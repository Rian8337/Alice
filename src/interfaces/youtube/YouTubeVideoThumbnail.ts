/**
 * Represents a YouTube video's thumbnail.
 */
export interface YouTubeVideoThumbnail {
    /**
     * The URL of the thumbnail.
     */
    readonly url: string;

    /**
     * The width of the thumbnail.
     */
    readonly width: number;

    /**
     * The height of the thumbnail.
     */
    readonly height: number;
}