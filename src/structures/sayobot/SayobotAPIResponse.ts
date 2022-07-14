import { SayobotBeatmap } from "./SayobotBeatmap";

/**
 * API response from Sayobot's `beatmaplist` API endpoint.
 */
export interface SayobotAPIResponse {
    readonly endid: number;
    readonly match_artist_results: number;
    readonly match_creator_results: number;
    readonly match_tags_results: number;
    readonly match_title_results: number;
    readonly match_version_results: number;
    readonly results: number;
    readonly status: number;
    readonly time_cost: number;
    readonly data: SayobotBeatmap[];
}
