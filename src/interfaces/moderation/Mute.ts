import { Snowflake } from "discord.js";

/**
 * Represents a temporary mute.
 */
export interface Mute {
    /**
     * The ID of the muted user.
     */
    userID: Snowflake;

    /**
     * The log channel ID of the guild when the user was muted.
     * 
     * This is stored in case the guild's log channel is changed
     * when the mute is active.
     */
    logChannelID: Snowflake;

    /**
     * The ID of the log message of the mute.
     */
    logMessageID: Snowflake;

    /**
     * The epoch time at which the user will be unmuted, in seconds.
     */
    muteEndTime: number;
}