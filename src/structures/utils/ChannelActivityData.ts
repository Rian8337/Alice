import { Snowflake } from "discord.js";

/**
 * Represents a channel's activity data.
 */
export interface ChannelActivityData {
    /**
     * The ID of the channel.
     */
    channelId: Snowflake;

    /**
     * The amount of messages sent in this day.
     */
    messageCount: number;

    /**
     * The amount of *English* words sent in this day.
     */
    wordsCount: number;
}
