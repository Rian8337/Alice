import { Snowflake } from "discord.js";

/**
 * Represents a statistic of an emoji.
 */
export interface EmojiStat {
    /**
     * The ID of the emoji.
     */
    id: Snowflake;

    /**
     * The amount of times the emoji has been used.
     */
    count: number;
}