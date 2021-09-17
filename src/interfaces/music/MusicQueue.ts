import { Snowflake } from "discord.js";
import { VideoSearchResult } from "yt-search";

/**
 * Represents a music queue.
 */
export interface MusicQueue {
    /**
     * The snippet of the video that contains this music.
     */
    readonly information: VideoSearchResult;

    /**
     * The user who queued this music.
     */
    readonly queuer: Snowflake;
};