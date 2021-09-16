import { YouTubeVideoInformation } from "@alice-interfaces/youtube/YouTubeVideoInformation";
import { YouTubeVideoSnippet } from "@alice-interfaces/youtube/YouTubeVideoSnippet";
import { RequestResponse } from "osu-droid";
import { RESTManager } from "./RESTManager";

/**
 * Manages API endpoints for YouTube data API.
 */
export abstract class YouTubeRESTManager extends RESTManager {
    private static readonly host: string = `https://www.googleapis.com/youtube/v3/`;

    /**
     * Gets the snippet information of a YouTube video.
     * 
     * @param id The ID of the video.
     * @returns The snippet information of the video, `null` if not found.
     */
    static async getSnippet(id: string): Promise<YouTubeVideoSnippet | null> {
        const result: RequestResponse = await this.request(this.host + `videos?key=${process.env.YOUTUBE_API_KEY}&part=snippet&id=${id}`);

        if (result.statusCode !== 200) {
            return null;
        }

        let info: any;
        try {
            info = JSON.parse(result.data.toString("utf-8"));
        } catch (ignored) {
            return null;
        }

        const items = info?.items[0]?.snippet;

        if (!items) {
            return null;
        }

        return items;
    }

    /**
     * Searches for videos in YouTube.
     * 
     * @param query The query to search for.
     */
    static async searchVideos(query: string): Promise<YouTubeVideoInformation[]> {
        const result: RequestResponse = await this.request(this.host + `search?key=${process.env.YOUTUBE_API_KEY}&part=snippet&q=${query}&type=video&maxResults=25`);

        if (result.statusCode !== 200) {
            return [];
        }

        let info: any;
        try {
            info = JSON.parse(result.data.toString("utf-8"));
        } catch (ignored) {
            return [];
        }

        const items: any[] = info.items ?? [];

        if (!items) {
            return [];
        }

        return items.map(v => {
            return {
                kind: v.kind,
                etag: v.etag,
                id: v.id.videoId,
                snippet: v.snippet
            };
        });
    }
}