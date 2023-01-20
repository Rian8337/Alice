import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a channel's activity in a day.
 */
export interface DatabaseChannelActivity extends BaseDocument {
    /**
     * The ID of the channel.
     */
    channelId: Snowflake;

    /**
     * The epoch time of the data, in milliseconds.
     *
     * Since a channel's activity is stored in a per day basis, this timestamp
     * will always be at 00:00 UTC of a day.
     */
    timestamp: number;

    /**
     * The amount of messages sent in this day.
     */
    messageCount: number;

    /**
     * The amount of *English* words sent in this day.
     */
    wordsCount: number;
}
