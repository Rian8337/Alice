import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents data about channel activity in a specific time.
 */
export interface DatabaseChannelData extends BaseDocument {
    /**
     * The epoch time for the data, in milliseconds.
     */
    timestamp: number;

    /**
     * The data for each channel message activity.
     *
     * The first element is the channel's ID, the second element is its message count in that day.
     */
    channels: [Snowflake, number][];
}
