import { YouTubeVideoInformation } from "@alice-interfaces/youtube/YouTubeVideoInformation";
import { decode } from "html-entities";
import { RequestResponse } from "osu-droid";
import { RESTManager } from "./RESTManager";

/**
 * Manages API endpoints for YouTube data API.
 */
export abstract class YouTubeRESTManager extends RESTManager {
    private static readonly host: string = `https://www.googleapis.com/youtube/v3/`;

    /**
     * Gets the information of a YouTube video.
     * 
     * @param id The ID of the video.
     * @returns The information of the video, `null` if not found.
     */
    static async getInformation(id: string): Promise<YouTubeVideoInformation | null> {
        const result: RequestResponse = await this.request(this.host + `videos?key=${process.env.YOUTUBE_API_KEY}&part=snippet&id=${id}`);

        if (result.statusCode !== 200) {
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let info: any;
        try {
            info = JSON.parse(result.data.toString("utf-8"));
        } catch {
            return null;
        }

        const item = info?.items[0];

        if (!item) {
            return null;
        }

        item.title = decode(item.title);

        return {
            kind: item.kind,
            etag: item.etag,
            id: item.id,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            snippet: item.snippet
        };
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let info: any;
        try {
            info = JSON.parse(result.data.toString("utf-8"));
        } catch {
            return [];
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = info.items ?? [];

        if (!items) {
            return [];
        }

        items.forEach(item => {
            item.snippet.title = decode(item.snippet.title);
        });

        return items.map(v => {
            return {
                kind: v.kind,
                etag: v.etag,
                id: v.id.videoId,
                url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
                snippet: v.snippet
            };
        });
    }
}